/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireUser, logActivity, HttpError } from '@/lib/server/auth';
import { handle } from '@/lib/server/api';
import { refreshSite } from '@/lib/server/revalidate';
import { clientIp } from '@/lib/server/util';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Collections included in a backup. Secrets, sessions and rate-limit data are never exported. */
const COLLS = ['settings', 'content', 'states', 'cities', 'localities', 'developers', 'properties', 'terms', 'blogs', 'seo', 'media', 'leads', 'users', 'stats_daily', 'counters', 'activity'];

export const GET = handle(async (req: Request) => {
  const { db, user } = await requireUser('backup');
  const sp = new URL(req.url).searchParams;
  if (sp.get('summary') === '1') {
    const counts = Object.fromEntries(await Promise.all(COLLS.map(async (c) => [c, await db.coll(c).count({})] as const)));
    return { counts, database: db.kind };
  }
  const data: Record<string, any[]> = {};
  for (const c of COLLS) data[c] = await db.coll(c).find({});
  await logActivity(db, user, 'backup_download', 'backup', '', `${Object.values(data).reduce((n, a) => n + a.length, 0)} records`, clientIp(req));
  const json = JSON.stringify({ app: 'realtechx', version: 1, createdAt: new Date().toISOString(), collections: data });
  return new Response(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="realtechx-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
});

/** POST a backup file: { collections: {...}, only?: string[] } — replaces those collections. */
export const POST = handle(async (req: Request) => {
  const { db, user } = await requireUser('backup');
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    throw new HttpError(400, 'This is not a valid backup file.');
  }
  if (payload?.app !== 'realtechx' || typeof payload.collections !== 'object') throw new HttpError(422, 'This is not a RealtechX backup file.');
  const only: string[] = Array.isArray(payload.only) && payload.only.length ? payload.only : COLLS.filter((c) => c !== 'users' && c !== 'activity');
  const restored: Record<string, number> = {};
  for (const c of only) {
    if (!COLLS.includes(c)) continue;
    const docs = payload.collections[c];
    if (!Array.isArray(docs)) continue;
    const clean = docs.filter((d: any) => d && typeof d._id === 'string');
    if (c === 'users') {
      if (!clean.some((u: any) => u.role === 'super_admin' && u.active)) throw new HttpError(422, 'Restoring users needs at least one active Super Admin in the file.');
    }
    if (c === 'settings' && !clean.some((d: any) => d._id === 'site')) continue;
    await db.coll(c).deleteMany({});
    for (let i = 0; i < clean.length; i += 500) await db.coll(c).insertMany(clean.slice(i, i + 500));
    restored[c] = clean.length;
  }
  await logActivity(db, user, 'backup_restore', 'backup', '', Object.entries(restored).map(([k, v]) => `${k}:${v}`).join(', '), '');
  refreshSite();
  return { restored };
});
