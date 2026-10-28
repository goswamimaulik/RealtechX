import { requireUser, logActivity } from '@/lib/server/auth';
import { handle, body } from '@/lib/server/api';
import { resourceOf } from '@/lib/server/resources';
import { refreshSite } from '@/lib/server/revalidate';
import { clientIp } from '@/lib/server/util';
import { HttpError } from '@/lib/server/auth';
import type { Filter } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type P = { params: Promise<{ resource: string }> };
const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** GET /api/admin/<resource>?q=&page=1&limit=25&sort=field&dir=desc&<filter>=… */
export const GET = handle(async (req: Request, { params }: P) => {
  const r = resourceOf((await params).resource);
  const { db } = await requireUser(r.perm);
  const sp = new URL(req.url).searchParams;
  const filter: Filter = { ...(r.extraFilter?.(sp) ?? {}) };
  for (const k of r.filters ?? []) {
    const v = sp.get(k);
    if (v) filter[k] = v;
  }
  const q = (sp.get('q') || '').trim().slice(0, 100);
  if (q) filter.$or = r.search.map((f) => ({ [f]: { $regex: escRe(q), $options: 'i' } }));

  const limit = Math.min(Math.max(Number(sp.get('limit')) || 25, 1), 500);
  const page = Math.max(Number(sp.get('page')) || 1, 1);
  const sortField = sp.get('sort');
  const sort = sortField && /^[\w.]+$/.test(sortField) ? { [sortField]: (sp.get('dir') === 'asc' ? 1 : -1) as 1 | -1 } : r.sort;
  const full = sp.get('full') === '1' || !r.listFields;
  const projection = full ? undefined : Object.fromEntries(r.listFields!.map((f) => [f, 1 as const]));

  const [items, total] = await Promise.all([
    db.coll(r.coll).find(filter, { sort, skip: (page - 1) * limit, limit, projection }),
    db.coll(r.coll).count(filter),
  ]);
  return { items: r.out ? items.map(r.out) : items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
});

/** POST /api/admin/<resource> — create */
export const POST = handle(async (req: Request, { params }: P) => {
  const r = resourceOf((await params).resource);
  const { db, user } = await requireUser(r.perm);
  if (r.readOnly || r.noCreate || !r.create) throw new HttpError(405, 'Not allowed');
  const doc = await r.create(await body(req), { db, user });
  await db.coll(r.coll).insertOne(doc);
  await r.afterWrite?.(doc, null, { db, user });
  await logActivity(db, user, 'create', r.label, doc._id, r.name(doc), clientIp(req));
  if (r.site) refreshSite();
  return { item: r.out ? r.out(doc) : doc };
});
