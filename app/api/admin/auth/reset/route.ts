import { adminDb, sha256, hashPassword, passwordProblem, logActivity, HttpError } from '@/lib/server/auth';
import { handle, body } from '@/lib/server/api';
import { nowIso } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = handle(async (req: Request) => {
  const { token, password } = await body<{ token?: string; password?: string }>(req);
  if (!token) throw new HttpError(422, 'This reset link is invalid.');
  const problem = passwordProblem(String(password || ''));
  if (problem) throw new HttpError(422, problem);
  const db = await adminDb();
  const rec = await db.coll('resets').findOne({ hash: sha256(token) });
  if (!rec || new Date(rec.expiresAt).getTime() < Date.now()) throw new HttpError(410, 'This reset link has expired. Please request a new one.');
  const user = await db.coll('users').findOne({ _id: rec.userId });
  if (!user) throw new HttpError(410, 'This reset link is no longer valid.');
  await db.coll('users').updateOne(
    { _id: user._id },
    { $set: { passwordHash: await hashPassword(String(password)), updatedAt: nowIso() }, $inc: { sessionVersion: 1 } },
  );
  await db.coll('resets').deleteMany({ userId: user._id });
  await db.coll('ratelimits').deleteOne({ _id: `login:${user.email}` });
  await logActivity(db, { id: user._id, name: user.name }, 'password_reset', 'auth', user._id);
  return { message: 'Password updated. You can now log in.' };
});
