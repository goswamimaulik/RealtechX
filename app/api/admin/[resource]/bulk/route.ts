import { requireUser, logActivity, HttpError } from '@/lib/server/auth';
import { handle, body } from '@/lib/server/api';
import { resourceOf } from '@/lib/server/resources';
import { refreshSite } from '@/lib/server/revalidate';
import { clientIp } from '@/lib/server/util';
import { nowIso } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type P = { params: Promise<{ resource: string }> };

/**
 * POST /api/admin/<resource>/bulk  { ids: string[], action, value? }
 * actions: delete · publish · draft · pending · feature · unfeature · status (leads/properties) · assign (leads) · spam · notspam
 */
export const POST = handle(async (req: Request, { params }: P) => {
  const r = resourceOf((await params).resource);
  const ctx = await requireUser(r.perm);
  const { ids, action, value } = await body<{ ids?: string[]; action?: string; value?: string }>(req);
  if (!Array.isArray(ids) || !ids.length) throw new HttpError(422, 'Select at least one item.');
  if (ids.length > 500) throw new HttpError(422, 'Too many items at once (max 500).');
  if (r.readOnly) throw new HttpError(405, 'Not allowed');
  const c = ctx.db.coll(r.coll);
  const now = nowIso();
  let done = 0;
  const skipped: string[] = [];

  const setMany = async (set: Record<string, unknown>) => {
    for (const id of ids) if (await c.updateOne({ _id: id }, { $set: { ...set, updatedAt: now } })) done++;
  };

  switch (action) {
    case 'delete': {
      if (r.noDelete) throw new HttpError(405, 'Not allowed');
      for (const id of ids) {
        const doc = await c.findOne({ _id: id });
        if (!doc) continue;
        const reason = await r.blockDelete?.(doc, ctx);
        if (reason) {
          skipped.push(`${r.name(doc)}: ${reason}`);
          continue;
        }
        await c.deleteOne({ _id: id });
        await r.afterDelete?.(doc, ctx);
        done++;
      }
      break;
    }
    case 'publish':
    case 'draft':
    case 'pending': {
      if (!['properties', 'blogs', 'developers'].includes(r.coll)) throw new HttpError(422, 'Not supported here');
      for (const id of ids) {
        const doc = await c.findOne({ _id: id });
        if (!doc) continue;
        const set: Record<string, unknown> = { publish: action === 'publish' ? 'published' : action, updatedAt: now };
        if (action === 'publish' && r.coll === 'properties') {
          if (!doc.images?.length) {
            skipped.push(`${r.name(doc)}: add an image first`);
            continue;
          }
          if (doc.publish !== 'published') Object.assign(set, { publishedAt: now, postedOn: now.slice(0, 10) });
        }
        await c.updateOne({ _id: id }, { $set: set });
        done++;
      }
      break;
    }
    case 'feature':
    case 'unfeature':
      if (r.coll !== 'properties') throw new HttpError(422, 'Not supported here');
      await setMany({ featured: action === 'feature' });
      break;
    case 'status': {
      const allowed = r.coll === 'leads' ? ['new', 'contacted', 'qualified', 'closed', 'lost'] : ['new-launch', 'under-construction', 'ready-to-move'];
      if (!allowed.includes(String(value))) throw new HttpError(422, 'Choose a valid status.');
      if (!['leads', 'properties'].includes(r.coll)) throw new HttpError(422, 'Not supported here');
      await setMany({ status: value });
      break;
    }
    case 'assign':
      if (r.coll !== 'leads') throw new HttpError(422, 'Not supported here');
      await setMany({ assignedTo: String(value || '') });
      break;
    case 'spam':
    case 'notspam':
      if (r.coll !== 'leads') throw new HttpError(422, 'Not supported here');
      await setMany({ spam: action === 'spam' });
      break;
    default:
      throw new HttpError(422, 'Unknown action');
  }

  await logActivity(ctx.db, ctx.user, `bulk_${action}`, r.label, '', `${done} item(s)${value ? ` → ${value}` : ''}`, clientIp(req));
  if (r.site && done) refreshSite();
  return { done, skipped };
});
