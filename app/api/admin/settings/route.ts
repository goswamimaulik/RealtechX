/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireUser, logActivity, HttpError } from '@/lib/server/auth';
import { handle, body } from '@/lib/server/api';
import { refreshSite } from '@/lib/server/revalidate';
import { defaultSettings } from '@/lib/server/seed';
import { smtpConfig, sendMail, emailLayout } from '@/lib/server/mail';
import { cloudinaryConfig } from '@/lib/server/cloudinary';
import { str, text, num, bool, url, email, emailList, phoneE164 } from '@/lib/server/validate';
import { clientIp } from '@/lib/server/util';
import type { SiteSettings } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function state(db: Awaited<ReturnType<typeof requireUser>>['db']) {
  const s = await db.coll('settings').findOne({ _id: 'site' });
  const { _id, ...settings } = { ...defaultSettings, ...(s ?? {}) } as any;
  void _id;
  const smtpSec = await db.coll('secrets').findOne({ _id: 'smtp' });
  const cloudSec = await db.coll('secrets').findOne({ _id: 'cloudinary' });
  const smtpLive = await smtpConfig(db);
  const cloudLive = await cloudinaryConfig(db);
  return {
    settings,
    smtp: {
      host: smtpSec?.host ?? 'smtp.gmail.com',
      port: smtpSec?.port ?? 465,
      user: smtpSec?.user ?? '',
      from: smtpSec?.from ?? '',
      hasPass: !!smtpSec?.pass,
      fromEnv: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      active: !!smtpLive,
      activeUser: smtpLive?.user ?? '',
    },
    cloudinary: {
      cloudName: cloudSec?.cloudName ?? '',
      apiKey: cloudSec?.apiKey ?? '',
      hasSecret: !!cloudSec?.apiSecret,
      fromEnv: !!cloudLive?.fromEnv,
      active: !!cloudLive,
      activeCloud: cloudLive?.cloudName ?? '',
    },
    env: {
      database: db.kind,
      authSecret: !!process.env.AUTH_SECRET,
      adminEmail: !!process.env.ADMIN_EMAIL,
    },
  };
}

export const GET = handle(async () => {
  const { db } = await requireUser('settings');
  return state(db);
});

function clean(i: any): SiteSettings {
  const d = defaultSettings;
  const o = (v: any) => (v && typeof v === 'object' ? v : {});
  // call links always follow the displayed number
  const phoneRaw = phoneE164(i.phone) || phoneE164(i.phoneRaw) || d.phoneRaw;
  return {
    name: str(i.name, 60) || d.name,
    tagline: str(i.tagline, 160),
    description: text(i.description, 600),
    url: (url(i.url) || d.url).replace(/\/$/, ''),
    logoUrl: url(i.logoUrl),
    faviconUrl: url(i.faviconUrl),
    currency: 'INR',
    phone: str(i.phone, 30) || d.phone,
    phoneRaw,
    whatsapp: str(i.whatsapp, 20).replace(/\D/g, '') || phoneRaw.replace(/\D/g, ''),
    email: email(i.email) || d.email,
    address: str(i.address, 300),
    hours: str(i.hours, 120),
    enquiryCta: str(i.enquiryCta, 40) || 'Get Best Price',
    previewNotice: str(i.previewNotice, 300),
    previewNoticeShort: str(i.previewNoticeShort, 120),
    showPreviewBar: bool(i.showPreviewBar),
    social: {
      instagram: url(o(i.social).instagram),
      facebook: url(o(i.social).facebook),
      linkedin: url(o(i.social).linkedin),
      youtube: url(o(i.social).youtube),
      twitter: url(o(i.social).twitter),
    },
    notify: { enabled: bool(o(i.notify).enabled), emails: emailList(o(i.notify).emails) },
    analytics: {
      gaId: /^G-[A-Z0-9]+$/i.test(str(o(i.analytics).gaId, 30)) ? str(o(i.analytics).gaId, 30).toUpperCase() : '',
      gscVerification: str(o(i.analytics).gscVerification, 120).replace(/^.*content="([^"]+)".*$/, '$1'),
    },
    maps: { apiKey: str(o(i.maps).apiKey, 120), defaultZoom: Math.round(num(o(i.maps).defaultZoom, 3, 20)) || 13 },
    uploads: {
      maxMb: Math.round(num(o(i.uploads).maxMb, 1, 100)) || 8,
      types: str(o(i.uploads).types, 200).toLowerCase().replace(/[^a-z0-9,]/g, '') || d.uploads.types,
    },
    cookie: { enabled: bool(o(i.cookie).enabled), text: str(o(i.cookie).text, 400) },
    seo: {
      titleTemplate: str(o(i.seo).titleTemplate, 80).includes('%s') ? str(o(i.seo).titleTemplate, 80) : '%s',
      defaultTitle: str(o(i.seo).defaultTitle, 160) || d.seo.defaultTitle,
      defaultDescription: str(o(i.seo).defaultDescription, 320),
      ogImage: url(o(i.seo).ogImage),
      keywords: str(o(i.seo).keywords, 600),
      indexing: bool(o(i.seo).indexing),
    },
    security: {
      sessionMinutes: Math.round(num(o(i.security).sessionMinutes, 5, 1440)) || 60,
      maxLoginAttempts: Math.round(num(o(i.security).maxLoginAttempts, 3, 20)) || 5,
    },
  };
}

export const PUT = handle(async (req: Request) => {
  const { db, user } = await requireUser('settings');
  const b = await body<any>(req);
  if (b.settings) {
    await db.coll('settings').updateOne({ _id: 'site' }, { $set: clean(b.settings) }, { upsert: true });
  }
  if (b.smtp) {
    const cur = (await db.coll('secrets').findOne({ _id: 'smtp' })) ?? {};
    const pass = b.smtp.pass === '__clear__' ? '' : str(b.smtp.pass, 200) || (cur as any).pass || '';
    await db.coll('secrets').updateOne(
      { _id: 'smtp' },
      { $set: { host: str(b.smtp.host, 120) || 'smtp.gmail.com', port: Math.round(num(b.smtp.port, 1, 65535)) || 465, user: str(b.smtp.user, 160), pass: pass.replace(/\s+/g, ''), from: str(b.smtp.from, 160) } },
      { upsert: true },
    );
  }
  if (b.cloudinary) {
    const cur = (await db.coll('secrets').findOne({ _id: 'cloudinary' })) ?? {};
    const secret = b.cloudinary.apiSecret === '__clear__' ? '' : str(b.cloudinary.apiSecret, 200) || (cur as any).apiSecret || '';
    await db.coll('secrets').updateOne(
      { _id: 'cloudinary' },
      { $set: { cloudName: str(b.cloudinary.cloudName, 80), apiKey: str(b.cloudinary.apiKey, 80), apiSecret: secret } },
      { upsert: true },
    );
  }
  await logActivity(db, user, 'update', 'settings', 'site', Object.keys(b).join(', '), clientIp(req));
  refreshSite();
  return state(db);
});

/** POST { action: 'test-email', to? } */
export const POST = handle(async (req: Request) => {
  const { db, user } = await requireUser('settings');
  const b = await body<{ action?: string; to?: string }>(req);
  if (b.action !== 'test-email') throw new HttpError(422, 'Unknown action');
  const s = await db.coll('settings').findOne({ _id: 'site' });
  const to = email(b.to) || user.email;
  try {
    const r = await sendMail(db, {
      to,
      subject: `${s?.name ?? 'RealtechX'} — test email`,
      html: emailLayout(s?.name ?? 'RealtechX', 'Test email', [['Status', 'Email notifications are working ✅'], ['Sent by', user.name]]),
      text: 'Email notifications are working.',
    });
    if (!r.sent) throw new HttpError(422, 'SMTP is not configured yet. Fill in the SMTP details and save first.');
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(422, `Email failed: ${e instanceof Error ? e.message : String(e)}`.slice(0, 300));
  }
  return { message: `Test email sent to ${to}.` };
});
