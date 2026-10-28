import { requireUser, logActivity, HttpError } from '@/lib/server/auth';
import { handle, body } from '@/lib/server/api';
import { resourceOf } from '@/lib/server/resources';
import { refreshSite } from '@/lib/server/revalidate';
import { clientIp } from '@/lib/server/util';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type P = { params: Promise<{ resource: string; id: string }> };

async function load(params: P['params']) {
  const { resource, id } = await params;
  const r = resourceOf(resource);
  const ctx = await requireUser(r.perm);
  const doc = await ctx.db.coll(r.coll).findOne({ _id: decodeURIComponent(id) });
  return { r, ctx, doc };
}

export const GET = handle(async (_req: Request, { params }: P) => {
  const { r, doc } = await load(params);
  if (!doc) throw new HttpError(404, `This ${r.label} was not found (it may have been deleted).`);
  return { item: r.out ? r.out(doc) : doc };
});

export const PUT = handle(async (req: Request, { params }: P) => {
  const { r, ctx, doc } = await load(params);
  if (r.readOnly || !r.update) throw new HttpError(405, 'Not allowed');
  if (!doc) throw new HttpError(404, `This ${r.label} was not found (it may have been deleted).`);
  const update = await r.update(doc, await body(req), ctx);
  await ctx.db.coll(r.coll).updateOne({ _id: doc._id }, update);
  const fresh = (await ctx.db.coll(r.coll).findOne({ _id: doc._id }))!;
  await r.afterWrite?.(fresh, doc, ctx);
  await logActivity(ctx.db, ctx.user, 'update', r.label, doc._id, r.name(fresh), clientIp(req));
  if (r.site) refreshSite();
  return { item: r.out ? r.out(fresh) : fresh };
});

export const DELETE = handle(async (req: Request, { params }: P) => {
  const { r, ctx, doc } = await load(params);
  if (r.readOnly || r.noDelete) throw new HttpError(405, 'Not allowed');
  if (!doc) return { deleted: 0 };
  const reason = await r.blockDelete?.(doc, ctx);
  if (reason) throw new HttpError(409, reason);
  await ctx.db.coll(r.coll).deleteOne({ _id: doc._id });
  await r.afterDelete?.(doc, ctx);
  await logActivity(ctx.db, ctx.user, 'delete', r.label, doc._id, r.name(doc), clientIp(req));
  if (r.site) refreshSite();
  return { deleted: 1 };
});
