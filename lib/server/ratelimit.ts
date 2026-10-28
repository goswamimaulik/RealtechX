import type { Db } from './db';

/**
 * Fixed-window rate limiter stored in the database so it works across serverless instances.
 * Returns `ok: false` once `limit` hits happen inside `windowMs`.
 */
export async function hit(db: Db, key: string, limit: number, windowMs: number) {
  const c = db.coll('ratelimits');
  const now = Date.now();
  const doc = await c.findOne({ _id: key });
  if (!doc || doc.resetAt < now) {
    await c.updateOne({ _id: key }, { $set: { count: 1, resetAt: now + windowMs } }, { upsert: true });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (doc.count >= limit) return { ok: false, remaining: 0, retryAfter: Math.ceil((doc.resetAt - now) / 1000) };
  await c.updateOne({ _id: key }, { $inc: { count: 1 } });
  return { ok: true, remaining: limit - doc.count - 1, retryAfter: 0 };
}

export async function peek(db: Db, key: string, limit: number) {
  const doc = await db.coll('ratelimits').findOne({ _id: key });
  if (!doc || doc.resetAt < Date.now()) return { blocked: false, retryAfter: 0 };
  return { blocked: doc.count >= limit, retryAfter: Math.ceil((doc.resetAt - Date.now()) / 1000) };
}

export async function clear(db: Db, key: string) {
  await db.coll('ratelimits').deleteOne({ _id: key });
}
