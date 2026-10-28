import { adminDb, verifyPassword, startSession, logActivity, DEMO_ADMIN } from '@/lib/server/auth';
import { handle, body } from '@/lib/server/api';
import { hit, clear, peek } from '@/lib/server/ratelimit';
import { clientIp } from '@/lib/server/util';
import { HttpError } from '@/lib/server/auth';
import { nowIso } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = handle(async (req: Request) => {
  const { email: rawEmail, password } = await body<{ email?: string; password?: string }>(req);
  const email = String(rawEmail || '').trim().toLowerCase();
  if (!email || !password) throw new HttpError(422, 'Enter your email and password.');

  const db = await adminDb();
  const settings = await db.coll('settings').findOne({ _id: 'site' });
  const max = Math.max(3, Number(settings?.security?.maxLoginAttempts) || 5);
  const ip = clientIp(req);
  const keyEmail = `login:${email}`;
  const keyIp = `login-ip:${ip}`;

  // Lock-out: max attempts per email (15 min) and 4× that per IP
  const [pe, pi] = await Promise.all([peek(db, keyEmail, max), peek(db, keyIp, max * 4)]);
  if (pe.blocked || pi.blocked) {
    const mins = Math.ceil(Math.max(pe.retryAfter, pi.retryAfter) / 60);
    throw new HttpError(429, `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}, or reset your password.`);
  }

  const user = await db.coll('users').findOne({ email });
  const ok = !!user && user.active && (await verifyPassword(String(password), user.passwordHash));
  if (!ok) {
    await Promise.all([hit(db, keyEmail, max, 15 * 60_000), hit(db, keyIp, max * 4, 15 * 60_000)]);
    await logActivity(db, null, 'login_failed', 'auth', '', email, ip);
    const left = Math.max(0, max - ((await db.coll('ratelimits').findOne({ _id: keyEmail }))?.count ?? 0));
    throw new HttpError(401, user && !user.active ? 'This account is disabled. Contact your Super Admin.' : `Incorrect email or password.${left > 0 && left < max ? ` ${left} attempt${left === 1 ? '' : 's'} left.` : ''}`);
  }

  await clear(db, keyEmail);
  await db.coll('users').updateOne({ _id: user._id }, { $set: { lastLogin: nowIso() } });
  await startSession(db, user);
  await logActivity(db, { id: user._id, name: user.name }, 'login', 'auth', user._id, '', ip);
  return { user: { name: user.name, role: user.role }, demo: db.kind === 'memory' && email === DEMO_ADMIN.email };
});
