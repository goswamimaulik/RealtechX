import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

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
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  // Bots fill the hidden field — pretend success and drop it.
  if (body.website) return NextResponse.json({ ok: true });

  const name = String(body.name || '').trim().slice(0, 80);
  const countryCode = /^\+\d{1,4}$/.test(String(body.countryCode || '')) ? String(body.countryCode) : '+91';
  const digits = String(body.phone || '').replace(/\D/g, '');
  const phone = countryCode === '+91' ? digits.slice(-10) : digits;
  const valid = countryCode === '+91' ? /^[6-9]\d{9}$/.test(phone) : /^\d{6,14}$/.test(phone);
  if (!name || !valid) {
    return NextResponse.json({ ok: false, error: 'Name and a valid mobile number are required' }, { status: 422 });
  }

  const lead = {
    name,
    phone: `${countryCode} ${phone}`,
    email: String(body.email || '').trim().slice(0, 120),
    message: String(body.message || '').trim().slice(0, 2000),
    source: String(body.source || 'Website').slice(0, 120),
    property: String(body.property || '').slice(0, 300),
    intent: String(body.intent || '').slice(0, 120),
    page: String(body.page || '').slice(0, 500),
    createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };

  // Phase 2: lead is also saved to MongoDB here for the admin CRM.
  console.log('[lead]', JSON.stringify(lead));

  const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT } = process.env;
  const to = process.env.LEAD_NOTIFY_EMAIL || 'maulikgoswami202@gmail.com';

  if (SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST || 'smtp.gmail.com',
        port: Number(SMTP_PORT || 465),
        secure: Number(SMTP_PORT || 465) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      const rows = [
        ['Name', lead.name],
        ['Mobile', lead.phone],
        ['Email', lead.email || '—'],
        ['Property', lead.property || '—'],
        ['Intent', lead.intent || '—'],
        ['Source', lead.source],
        ['Message', lead.message || '—'],
        ['Page', lead.page || '—'],
        ['Received', lead.createdAt + ' IST'],
      ];
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
          <div style="background:#0B1020;color:#E7D3A4;padding:20px 24px;font-size:20px;font-weight:bold">RealtechX · New Lead</div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            ${rows.map(([k, v]) => `<tr><td style="padding:10px 24px;color:#6B7280;width:110px;border-bottom:1px solid #f3f3f3">${k}</td><td style="padding:10px 24px;border-bottom:1px solid #f3f3f3;white-space:pre-wrap">${esc(v)}</td></tr>`).join('')}
          </table>
          <div style="padding:16px 24px"><a href="tel:${lead.phone.replace(/\s/g, '')}" style="background:#C9A45C;color:#0B1020;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Call ${esc(lead.name)}</a></div>
        </div>`;
      await transporter.sendMail({
        from: `"RealtechX Leads" <${SMTP_USER}>`,
        to,
        replyTo: lead.email || undefined,
        subject: `🔔 New Lead: ${lead.name} — ${lead.property || lead.intent || lead.source}`,
        html,
        text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
      });
    } catch (err) {
      console.error('[lead] email failed', err);
      // Still return ok so the visitor is not blocked; the lead is in the logs.
    }
  } else {
    console.warn('[lead] SMTP_USER / SMTP_PASS not set — email notification skipped');
  }

  return NextResponse.json({ ok: true });
}
