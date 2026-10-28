import { requireUser, logActivity } from '@/lib/server/auth';
import { handle } from '@/lib/server/api';
import { resources } from '@/lib/server/resources';
import { clientIp, esc } from '@/lib/server/util';
import type { Filter } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const cols: [string, string][] = [
  ['leadId', 'Lead ID'],
  ['createdAt', 'Date & time (IST)'],
  ['name', 'Name'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['property', 'Property / project'],
  ['intent', 'Intent'],
  ['source', 'Source'],
  ['status', 'Status'],
  ['assigned', 'Assigned to'],
  ['followUp', 'Follow-up'],
  ['message', 'Message'],
  ['notes', 'Notes'],
  ['page', 'Page URL'],
];

/** GET /api/admin/export/leads?format=csv|xls&<same filters as the leads list>&ids=a,b */
export const GET = handle(async (req: Request) => {
  const { db, user } = await requireUser('leads');
  const sp = new URL(req.url).searchParams;
  const r = resources.leads;
  const filter: Filter = { ...(r.extraFilter?.(sp) ?? {}) };
  for (const k of r.filters ?? []) if (sp.get(k)) filter[k] = sp.get(k);
  const q = (sp.get('q') || '').trim();
  if (q) filter.$or = r.search.map((f) => ({ [f]: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }));
  const ids = (sp.get('ids') || '').split(',').filter(Boolean);
  if (ids.length) filter._id = { $in: ids };

  const [leads, users] = await Promise.all([db.coll('leads').find(filter, { sort: { createdAt: -1 }, limit: 20000 }), db.coll('users').find({}, { projection: { name: 1 } })]);
  const userName = Object.fromEntries(users.map((u) => [u._id, u.name]));
  const rows = leads.map((l) => ({
    ...l,
    createdAt: new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    assigned: userName[l.assignedTo] ?? '',
    notes: (l.notes ?? []).map((n: { at: string; by: string; text: string }) => `[${n.at.slice(0, 10)} ${n.by}] ${n.text}`).join(' | '),
  })) as Record<string, unknown>[];

  const stamp = new Date().toISOString().slice(0, 10);
  await logActivity(db, user, 'export', 'lead', '', `${rows.length} leads (${sp.get('format') || 'csv'})`, clientIp(req));

  if (sp.get('format') === 'xls') {
    // Excel 2003 XML spreadsheet — opens natively in Excel, Google Sheets & LibreOffice
    const cell = (v: unknown) => `<Cell><Data ss:Type="String">${esc(String(v ?? ''))}</Data></Cell>`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0B1020" ss:Pattern="Solid"/></Style></Styles>
<Worksheet ss:Name="Leads"><Table>
<Row>${cols.map(([, h]) => `<Cell ss:StyleID="h"><Data ss:Type="String">${esc(h)}</Data></Cell>`).join('')}</Row>
${rows.map((r) => `<Row>${cols.map(([k]) => cell(r[k])).join('')}</Row>`).join('\n')}
</Table></Worksheet></Workbook>`;
    return new Response(xml, {
      headers: { 'Content-Type': 'application/vnd.ms-excel; charset=utf-8', 'Content-Disposition': `attachment; filename="leads-${stamp}.xls"`, 'Cache-Control': 'no-store' },
    });
  }

  const csvCell = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@]/.test(s)) s = `'${s}`; // block spreadsheet formula injection
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = '﻿' + [cols.map(([, h]) => h).join(','), ...rows.map((r) => cols.map(([k]) => csvCell(r[k])).join(','))].join('\r\n');
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="leads-${stamp}.csv"`, 'Cache-Control': 'no-store' },
  });
});
