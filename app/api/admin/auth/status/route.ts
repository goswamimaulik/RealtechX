import { adminDb, DEMO_ADMIN } from '@/lib/server/auth';
import { handle } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Tells the login page whether setup is needed and whether demo mode is on (no secrets returned). */
export const GET = handle(async () => {
  const db = await adminDb();
  const users = await db.coll('users').count({});
  return {
    database: db.kind,
    needsSetup: users === 0,
    demo: db.kind === 'memory' ? DEMO_ADMIN : null,
  };
});
