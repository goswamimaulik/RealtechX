import { requireUser } from '@/lib/server/auth';
import { handle } from '@/lib/server/api';
import { permsOf } from '@/lib/auth/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const { db, user } = await requireUser();
  return { user, perms: permsOf(user.role), database: db.kind };
});
