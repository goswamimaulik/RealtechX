/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireUser, logActivity, HttpError } from '@/lib/server/auth';
import { handle, body } from '@/lib/server/api';
import { refreshSite } from '@/lib/server/revalidate';
import { defaultAbout, defaultContact, defaultFooter, defaultHome } from '@/lib/content-defaults';
import { str, text, url, lines } from '@/lib/server/validate';
import { clientIp } from '@/lib/server/util';
import { nowIso } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type P = { params: Promise<{ id: string }> };

const defaults: Record<string, any> = { home: defaultHome, about: defaultAbout, contact: defaultContact, footer: defaultFooter };
const isImageKey = (k: string) => /image|hero(Desktop|Mobile)|cover|logo/i.test(k);

/** Coerces input to the same shape as the default object (unknown keys are dropped). */
function shape(def: any, input: any, key = ''): any {
  if (typeof def === 'string') return isImageKey(key) ? url(input) || def : text(input, 4000);
  if (typeof def === 'boolean') return !!input;
  if (typeof def === 'number') return Number(input) || 0;
  if (Array.isArray(def)) {
    const arr = Array.isArray(input) ? input : typeof input === 'string' ? input.split('\n') : [];
    const sample = def[0];
    if (sample === undefined || typeof sample === 'string') return lines(arr, 60, 4000);
    return arr
      .slice(0, 60)
      .map((x: any) => shape(sample, x ?? {}))
      .filter((x: any) => Object.values(x).some((v) => (Array.isArray(v) ? v.length : !!v)));
  }
  if (def && typeof def === 'object') {
    const o = input && typeof input === 'object' ? input : {};
    return Object.fromEntries(Object.keys(def).map((k) => [k, shape(def[k], o[k] ?? (Array.isArray(def[k]) ? [] : typeof def[k] === 'string' ? '' : def[k]), k)]));
  }
  return input;
}

export const GET = handle(async (_req: Request, { params }: P) => {
  const id = decodeURIComponent((await params).id);
  const { db } = await requireUser('content');
  const doc = await db.coll('content').findOne({ _id: id });
  if (id.startsWith('legal:')) {
    if (!doc) throw new HttpError(404, 'Page not found');
    return { item: doc };
  }
  const def = defaults[id];
  if (!def) throw new HttpError(404, 'Page not found');
  return { item: { ...def, ...(doc ?? {}), _id: id }, defaults: def };
});

export const PUT = handle(async (req: Request, { params }: P) => {
  const id = decodeURIComponent((await params).id);
  const { db, user } = await requireUser('content');
  const input = await body<any>(req);
  let doc: Record<string, unknown>;
  if (id.startsWith('legal:')) {
    const existing = await db.coll('content').findOne({ _id: id });
    if (!existing) throw new HttpError(404, 'Page not found');
    const sections = (Array.isArray(input.sections) ? input.sections : [])
      .map((s: any) => ({ h: str(s?.h, 200), p: (Array.isArray(s?.p) ? s.p : String(s?.p ?? '').split(/\n{2,}/)).map((x: any) => text(x, 6000)).filter(Boolean) }))
      .filter((s: any) => s.h || s.p.length);
    doc = { title: str(input.title, 120) || existing.title, updated: nowIso().slice(0, 10), sections, slug: existing.slug, updatedAt: nowIso() };
  } else {
    const def = defaults[id];
    if (!def) throw new HttpError(404, 'Page not found');
    doc = { ...shape(def, input), updatedAt: nowIso() };
  }
  await db.coll('content').updateOne({ _id: id }, { $set: doc }, { upsert: true });
  await logActivity(db, user, 'update', 'content', id, id, clientIp(req));
  refreshSite();
  return { item: { _id: id, ...doc } };
});
