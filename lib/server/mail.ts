import nodemailer from 'nodemailer';
import type { Db } from './db';
import { esc } from './util';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from?: string;
}

/**
 * SMTP comes from environment variables (recommended on Vercel) or, if those are empty,
 * from Admin → Settings → Email (stored in the private `secrets` collection).
 */
export async function smtpConfig(db: Db): Promise<SmtpConfig | null> {
  const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT, SMTP_FROM } = process.env;
  if (SMTP_USER && SMTP_PASS) {
    return { host: SMTP_HOST || 'smtp.gmail.com', port: Number(SMTP_PORT || 465), user: SMTP_USER, pass: SMTP_PASS, from: SMTP_FROM };
  }
  const sec = await db.coll('secrets').findOne({ _id: 'smtp' }).catch(() => null);
  if (sec?.user && sec?.pass) return { host: sec.host || 'smtp.gmail.com', port: Number(sec.port || 465), user: sec.user, pass: sec.pass, from: sec.from };
  return null;
}

export async function sendMail(db: Db, msg: { to: string; subject: string; html: string; text?: string; replyTo?: string; fromName?: string }) {
  const cfg = await smtpConfig(db);
  if (!cfg) {
    console.warn('[mail] SMTP not configured — email skipped:', msg.subject);
    return { sent: false, reason: 'SMTP not configured' };
  }
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  await transporter.sendMail({
    from: cfg.from || `"${msg.fromName || 'RealtechX'}" <${cfg.user}>`,
    to: msg.to,
    replyTo: msg.replyTo,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
  });
  return { sent: true };
}

/** Branded HTML email body with a key/value table and optional button. */
export function emailLayout(brand: string, heading: string, rows: [string, string][], button?: { href: string; label: string }, intro?: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;border:1px solid #eee;border-radius:14px;overflow:hidden">
    <div style="background:#0B1020;color:#E7D3A4;padding:20px 24px;font-size:20px;font-weight:bold">${esc(brand)} · ${esc(heading)}</div>
    ${intro ? `<p style="padding:16px 24px 0;margin:0;font-size:14px;color:#374151;line-height:1.6">${esc(intro)}</p>` : ''}
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows
        .map(([k, v]) => `<tr><td style="padding:10px 24px;color:#6B7280;width:120px;border-bottom:1px solid #f3f3f3;vertical-align:top">${esc(k)}</td><td style="padding:10px 24px;border-bottom:1px solid #f3f3f3;white-space:pre-wrap">${esc(v)}</td></tr>`)
        .join('')}
    </table>
    ${button ? `<div style="padding:18px 24px"><a href="${esc(button.href)}" style="background:#C9A45C;color:#0B1020;padding:11px 20px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block">${esc(button.label)}</a></div>` : ''}
  </div>`;
}
