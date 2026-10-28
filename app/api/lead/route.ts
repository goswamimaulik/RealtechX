import { NextResponse } from 'next/server';
import { getDb, nextSeq, nowIso, type Db } from '@/lib/server/db';
import { ensureSeeded } from '@/lib/server/seed';
import { hit } from '@/lib/server/ratelimit';
import { sendMail, emailLayout } from '@/lib/server/mail';
import { clientIp, istDate } from '@/lib/server/util';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LeadBody = {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  source?: string;
  property?: string;
  intent?: string;
  page?: string;
  website?: string; // honeypot
  countryCode?: string;
  elapsed?: number; // ms the visitor spent on the form
};

const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  // Bots fill the hidden field — pretend success and drop it.
  if (body.website) return NextResponse.json({ ok: true });

  const name = clip(body.name, 80);
  const countryCode = /^\+\d{1,4}$/.test(String(body.countryCode || '')) ? String(body.countryCode) : '+91';
  const digits = String(body.phone || '').replace(/\D/g, '');
  const phone = countryCode === '+91' ? digits.slice(-10) : digits;
  const valid = countryCode === '+91' ? /^[6-9]\d{9}$/.test(phone) : /^\d{6,14}$/.test(phone);
  if (!name || !valid) {
    return NextResponse.json({ ok: false, error: 'Name and a valid mobile number are required' }, { status: 422 });
  }
  const email = clip(body.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address' }, { status: 422 });
  }

  const ip = clientIp(req);
  const message = clip(body.message, 2000);
  const page = clip(body.page, 500);
  const slugMatch = page.match(/\/property\/([a-z0-9-]+)/i);

  let db: Db | null = null;
  try {
    db = await getDb();
    await ensureSeeded(db);
  } catch (e) {
    console.error('[lead] database unavailable', e);
  }

  // Per-IP limit: 6 enquiries per 10 minutes
  if (db) {
    const rl = await hit(db, `lead:${ip}`, 6, 10 * 60_000).catch(() => ({ ok: true, retryAfter: 0 }));
    if (!rl.ok) {
      return NextResponse.json({ ok: false, error: 'Too many enquiries from your network. Please try again in a few minutes or call us.' }, { status: 429 });
    }
  }

  // Simple spam signals — the lead is still saved but flagged, so nothing genuine is lost.
  const links = (message.match(/https?:\/\//gi) || []).length;
  const tooFast = typeof body.elapsed === 'number' && body.elapsed >= 0 && body.elapsed < 1500;
  const spam = links > 2 || tooFast || /\b(viagra|casino|crypto ?airdrop|seo services|backlinks)\b/i.test(message);

  const now = nowIso();
  const lead = {
    name,
    phone: `${countryCode} ${phone}`,
    email,
    message,
    source: clip(body.source || 'Website', 120),
    property: clip(body.property, 300),
    propertySlug: slugMatch?.[1] ?? '',
    intent: clip(body.intent, 120),
    page,
    status: 'new' as const,
    assignedTo: '',
    followUp: '',
    notes: [] as { at: string; by: string; text: string }[],
    spam,
    ip,
    userAgent: clip(req.headers.get('user-agent'), 300),
    createdAt: now,
    updatedAt: now,
  };

  let leadId = '';
  if (db) {
    try {
      const n = await nextSeq(db, 'lead', 10001);
      leadId = `RTX-${n}`;
      await db.coll('leads').insertOne({ _id: leadId, leadId, ...lead });
      if (!spam) await db.coll('stats_daily').updateOne({ _id: istDate() }, { $inc: { leads: 1 }, $set: { date: istDate() } }, { upsert: true });
    } catch (e) {
      console.error('[lead] save failed', e);
    }
  }
  console.log('[lead]', JSON.stringify({ leadId, ...lead, ip: undefined }));

  // Email notification (Admin → Settings → Notifications)
  if (db && !spam) {
    try {
      const { settings } = await getStore();
      const to = settings.notify.enabled ? settings.notify.emails || process.env.LEAD_NOTIFY_EMAIL || settings.email : '';
      if (to) {
        const received = new Date(now).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const rows: [string, string][] = [
          ['Lead ID', leadId || '—'],
          ['Name', lead.name],
          ['Mobile', lead.phone],
          ['Email', lead.email || '—'],
          ['Property', lead.property || '—'],
          ['Intent', lead.intent || '—'],
          ['Source', lead.source],
          ['Message', lead.message || '—'],
          ['Page', lead.page || '—'],
          ['Received', `${received} IST`],
        ];
        const base = settings.url.replace(/\/$/, '');
        await sendMail(db, {
          to,
          subject: `🔔 New Lead ${leadId}: ${lead.name} — ${lead.property || lead.intent || lead.source}`,
          html: emailLayout(settings.name, 'New Lead', rows, { href: `${base}/admin/leads?open=${encodeURIComponent(leadId)}`, label: 'Open in Admin' }),
          text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
          replyTo: lead.email || undefined,
          fromName: `${settings.name} Leads`,
        });
      }
    } catch (err) {
      console.error('[lead] email failed', err);
    }
  }

  return NextResponse.json({ ok: true, leadId });
}
