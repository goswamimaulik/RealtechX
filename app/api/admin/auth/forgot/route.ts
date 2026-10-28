import { adminDb, randomToken, sha256, logActivity, HttpError } from '@/lib/server/auth';
import { handle, body } from '@/lib/server/api';
import { hit } from '@/lib/server/ratelimit';
import { sendMail, emailLayout } from '@/lib/server/mail';
import { clientIp } from '@/lib/server/util';
import { newId } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = handle(async (req: Request) => {
  const { email: raw } = await body<{ email?: string }>(req);
  const email = String(raw || '').trim().toLowerCase();
  if (!email) throw new HttpError(422, 'Enter your email address.');
  const db = await adminDb();
  const rl = await hit(db, `forgot:${clientIp(req)}`, 5, 30 * 60_000);
  if (!rl.ok) throw new HttpError(429, 'Too many requests. Please try again later.');

  const user = await db.coll('users').findOne({ email });
  // Same answer whether or not the account exists (no account discovery)
  if (user?.active) {
    const token = randomToken();
    await db.coll('resets').deleteMany({ userId: user._id });
    await db.coll('resets').insertOne({ _id: newId(), userId: user._id, hash: sha256(token), expiresAt: new Date(Date.now() + 30 * 60_000) });
    const settings = await db.coll('settings').findOne({ _id: 'site' });
    const origin = new URL(req.url).origin;
    const link = `${origin}/admin/reset?token=${encodeURIComponent(token)}`;
    const r = await sendMail(db, {
      to: email,
      subject: `Reset your ${settings?.name ?? 'RealtechX'} admin password`,
      html: emailLayout(settings?.name ?? 'RealtechX', 'Password reset', [['Account', email], ['Valid for', '30 minutes']], { href: link, label: 'Set a new password' }, 'We received a request to reset your admin password. If this wasn’t you, ignore this email.'),
      text: `Reset your password: ${link} (valid for 30 minutes)`,
    }).catch((e) => {
      console.error('[forgot] email failed', e);
      return { sent: false };
    });
    await logActivity(db, { id: user._id, name: user.name }, 'password_reset_requested', 'auth', user._id, r.sent ? 'email sent' : 'email NOT sent (SMTP missing)');
    if (!r.sent) return { message: 'Email is not configured on this site yet, so the reset link could not be sent. Ask your Super Admin to reset your password from Admin → Users.' };
  }
  return { message: 'If an account exists for this email, a reset link has been sent. It is valid for 30 minutes.' };
});
