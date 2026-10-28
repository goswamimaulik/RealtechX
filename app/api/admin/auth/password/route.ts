import { requireUser, verifyPassword, hashPassword, passwordProblem, startSession, logActivity, HttpError } from '@/lib/server/auth';
import { handle, body } from '@/lib/server/api';
import { nowIso } from '@/lib/server/db';

export const runtime = 'nodejs';

/** Change own password / profile. Changing the password logs out all other sessions. */
export const POST = handle(async (req: Request) => {
  const { db, user } = await requireUser();
  const b = await body<{ current?: string; password?: string; name?: string; phone?: string }>(req);
  const u = await db.coll('users').findOne({ _id: user.id });
  if (!u) throw new HttpError(404, 'User not found');
  const set: Record<string, unknown> = { updatedAt: nowIso() };
  if (b.name !== undefined) set.name = String(b.name).trim().slice(0, 80) || u.name;
  if (b.phone !== undefined) set.phone = String(b.phone).trim().slice(0, 20);
  let changedPw = false;
  if (b.password) {
    if (!(await verifyPassword(String(b.current || ''), u.passwordHash))) throw new HttpError(422, 'Current password is incorrect.');
    const problem = passwordProblem(String(b.password));
    if (problem) throw new HttpError(422, problem);
    set.passwordHash = await hashPassword(String(b.password));
    changedPw = true;
  }
  await db.coll('users').updateOne({ _id: u._id }, changedPw ? { $set: set, $inc: { sessionVersion: 1 } } : { $set: set });
  if (changedPw) {
    const fresh = await db.coll('users').findOne({ _id: u._id });
    if (fresh) await startSession(db, fresh);
  }
  await logActivity(db, user, changedPw ? 'password_changed' : 'profile_updated', 'user', user.id);
  return { message: changedPw ? 'Password changed. Other devices have been logged out.' : 'Profile saved.' };
});
