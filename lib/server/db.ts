/**
 * Tiny database adapter.
 *  - Production: MongoDB (set MONGODB_URI). Uses only basic, well-known driver calls.
 *  - No MONGODB_URI: an in-memory store seeded from the bundled demo data, so the website
 *    always works. (Admin changes are NOT persisted in this mode — connect MongoDB for that.)
 *
 * Documents use string `_id`s (no ObjectId) and ISO date strings.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type Doc = { _id: string; [k: string]: any };
export type Filter = Record<string, any>;
export type Update = { $set?: Record<string, any>; $inc?: Record<string, number>; $push?: Record<string, any>; $unset?: Record<string, any> };
export type FindOpts = { sort?: Record<string, 1 | -1>; limit?: number; skip?: number; projection?: Record<string, 0 | 1> };

export interface Coll {
  find(filter?: Filter, opts?: FindOpts): Promise<Doc[]>;
  findOne(filter: Filter): Promise<Doc | null>;
  count(filter?: Filter): Promise<number>;
  insertOne(doc: Doc): Promise<Doc>;
  insertMany(docs: Doc[]): Promise<void>;
  updateOne(filter: Filter, update: Update, opts?: { upsert?: boolean }): Promise<boolean>;
  updateMany(filter: Filter, update: Update): Promise<number>;
  deleteOne(filter: Filter): Promise<boolean>;
  deleteMany(filter: Filter): Promise<number>;
}

export interface Db {
  kind: 'mongo' | 'memory';
  coll(name: string): Coll;
  /** atomically increments and returns a named counter (first value = start) */
  seq(name: string, start: number): Promise<number>;
}

/* ───────────────────────── in-memory implementation ───────────────────────── */

const get = (o: any, path: string) => path.split('.').reduce((v, k) => (v == null ? v : v[k]), o);
const setPath = (o: any, path: string, val: any) => {
  const ks = path.split('.');
  let cur = o;
  ks.slice(0, -1).forEach((k) => (cur = cur[k] ??= {}));
  cur[ks[ks.length - 1]] = val;
};
const clone = <T>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

function cmp(a: any, b: any) {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  return a < b ? -1 : 1;
}

function matchValue(val: any, cond: any): boolean {
  if (cond && typeof cond === 'object' && !Array.isArray(cond) && Object.keys(cond).some((k) => k.startsWith('$'))) {
    return Object.entries(cond).every(([op, arg]: [string, any]) => {
      switch (op) {
        case '$in': return Array.isArray(val) ? val.some((v) => arg.includes(v)) : arg.includes(val);
        case '$nin': return Array.isArray(val) ? !val.some((v) => arg.includes(v)) : !arg.includes(val);
        case '$ne': return Array.isArray(val) ? !val.includes(arg) : val !== arg;
        case '$gt': return val != null && cmp(val, arg) > 0;
        case '$gte': return val != null && cmp(val, arg) >= 0;
        case '$lt': return val != null && cmp(val, arg) < 0;
        case '$lte': return val != null && cmp(val, arg) <= 0;
        case '$exists': return arg ? val !== undefined : val === undefined;
        case '$regex': {
          const re = arg instanceof RegExp ? arg : new RegExp(arg, cond.$options || '');
          return Array.isArray(val) ? val.some((v) => re.test(String(v))) : val != null && re.test(String(val));
        }
        case '$options': return true;
        default: return false;
      }
    });
  }
  if (Array.isArray(val) && !Array.isArray(cond)) return val.includes(cond);
  return JSON.stringify(val) === JSON.stringify(cond);
}

export function matches(doc: any, filter: Filter = {}): boolean {
  return Object.entries(filter).every(([k, cond]) => {
    if (k === '$or') return (cond as Filter[]).some((f) => matches(doc, f));
    if (k === '$and') return (cond as Filter[]).every((f) => matches(doc, f));
    return matchValue(get(doc, k), cond);
  });
}

function applyUpdate(doc: any, u: Update) {
  for (const [k, v] of Object.entries(u.$set ?? {})) setPath(doc, k, clone(v));
  for (const [k, v] of Object.entries(u.$inc ?? {})) setPath(doc, k, (get(doc, k) ?? 0) + v);
  for (const [k, v] of Object.entries(u.$push ?? {})) {
    const arr = get(doc, k) ?? [];
    if (v && typeof v === 'object' && '$each' in v) arr.push(...clone(v.$each));
    else arr.push(clone(v));
    setPath(doc, k, arr);
  }
  for (const k of Object.keys(u.$unset ?? {})) {
    const ks = k.split('.');
    const parent = ks.length > 1 ? get(doc, ks.slice(0, -1).join('.')) : doc;
    if (parent) delete parent[ks[ks.length - 1]];
  }
}

class MemColl implements Coll {
  constructor(private rows: Doc[]) {}
  async find(filter: Filter = {}, opts: FindOpts = {}) {
    let out = this.rows.filter((d) => matches(d, filter));
    if (opts.sort) {
      const keys = Object.entries(opts.sort);
      out = [...out].sort((a, b) => {
        for (const [k, dir] of keys) {
          const c = cmp(get(a, k), get(b, k));
          if (c) return c * dir;
        }
        return 0;
      });
    }
    if (opts.skip) out = out.slice(opts.skip);
    if (opts.limit) out = out.slice(0, opts.limit);
    if (opts.projection) {
      const inc = Object.entries(opts.projection).filter(([, v]) => v === 1).map(([k]) => k);
      const exc = Object.entries(opts.projection).filter(([, v]) => v === 0).map(([k]) => k);
      return out.map((d) => {
        if (inc.length) {
          const o: Doc = { _id: d._id };
          inc.forEach((k) => (o[k] = clone(d[k])));
          return o;
        }
        const o = clone(d);
        exc.forEach((k) => delete o[k]);
        return o;
      });
    }
    return out.map(clone);
  }
  async findOne(filter: Filter) {
    const d = this.rows.find((r) => matches(r, filter));
    return d ? clone(d) : null;
  }
  async count(filter: Filter = {}) {
    return this.rows.filter((d) => matches(d, filter)).length;
  }
  async insertOne(doc: Doc) {
    if (this.rows.some((r) => r._id === doc._id)) throw new Error(`Duplicate _id ${doc._id}`);
    this.rows.push(clone(doc));
    return clone(doc);
  }
  async insertMany(docs: Doc[]) {
    for (const d of docs) await this.insertOne(d);
  }
  async updateOne(filter: Filter, update: Update, opts: { upsert?: boolean } = {}) {
    const d = this.rows.find((r) => matches(r, filter));
    if (d) {
      applyUpdate(d, update);
      return true;
    }
    if (opts.upsert) {
      const base: Doc = { _id: String(filter._id ?? Math.random().toString(36).slice(2)) };
      Object.entries(filter).forEach(([k, v]) => !k.startsWith('$') && typeof v !== 'object' && setPath(base, k, v));
      applyUpdate(base, update);
      this.rows.push(base);
      return true;
    }
    return false;
  }
  async updateMany(filter: Filter, update: Update) {
    const ds = this.rows.filter((r) => matches(r, filter));
    ds.forEach((d) => applyUpdate(d, update));
    return ds.length;
  }
  async deleteOne(filter: Filter) {
    const i = this.rows.findIndex((r) => matches(r, filter));
    if (i < 0) return false;
    this.rows.splice(i, 1);
    return true;
  }
  async deleteMany(filter: Filter) {
    const before = this.rows.length;
    for (let i = this.rows.length - 1; i >= 0; i--) if (matches(this.rows[i], filter)) this.rows.splice(i, 1);
    return before - this.rows.length;
  }
}

class MemDb implements Db {
  kind = 'memory' as const;
  private data = new Map<string, Doc[]>();
  coll(name: string) {
    if (!this.data.has(name)) this.data.set(name, []);
    return new MemColl(this.data.get(name)!);
  }
  async seq(name: string, start: number) {
    const c = this.coll('counters');
    const cur = await c.findOne({ _id: name });
    if (!cur) {
      await c.insertOne({ _id: name, seq: start });
      return start;
    }
    await c.updateOne({ _id: name }, { $inc: { seq: 1 } });
    return (cur.seq as number) + 1;
  }
}

/* ───────────────────────── MongoDB implementation ───────────────────────── */

class MongoCollAdapter implements Coll {
  constructor(private c: any) {}
  find(filter: Filter = {}, opts: FindOpts = {}) {
    let cur = this.c.find(filter, opts.projection ? { projection: opts.projection } : undefined);
    if (opts.sort) cur = cur.sort(opts.sort);
    if (opts.skip) cur = cur.skip(opts.skip);
    if (opts.limit) cur = cur.limit(opts.limit);
    return cur.toArray();
  }
  findOne(filter: Filter) {
    return this.c.findOne(filter);
  }
  count(filter: Filter = {}) {
    return this.c.countDocuments(filter);
  }
  async insertOne(doc: Doc) {
    await this.c.insertOne(doc);
    return doc;
  }
  async insertMany(docs: Doc[]) {
    if (docs.length) await this.c.insertMany(docs, { ordered: false });
  }
  async updateOne(filter: Filter, update: Update, opts: { upsert?: boolean } = {}) {
    const r = await this.c.updateOne(filter, update, { upsert: !!opts.upsert });
    return r.matchedCount > 0 || !!r.upsertedCount;
  }
  async updateMany(filter: Filter, update: Update) {
    const r = await this.c.updateMany(filter, update);
    return r.modifiedCount;
  }
  async deleteOne(filter: Filter) {
    const r = await this.c.deleteOne(filter);
    return r.deletedCount > 0;
  }
  async deleteMany(filter: Filter) {
    const r = await this.c.deleteMany(filter);
    return r.deletedCount;
  }
}

class MongoDb implements Db {
  kind = 'mongo' as const;
  constructor(private db: any) {}
  coll(name: string) {
    return new MongoCollAdapter(this.db.collection(name));
  }
  async seq(name: string, start: number) {
    const c = this.db.collection('counters');
    // first use: create the counter at start-1 so the $inc below returns `start`
    await c.updateOne({ _id: name }, { $setOnInsert: { seq: start - 1 } }, { upsert: true });
    const r = await c.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { returnDocument: 'after' });
    const doc = r && 'value' in r && r.value !== undefined ? r.value : r; // driver v5 returns {value}, v6 returns the doc
    return Number(doc?.seq ?? start);
  }
}

/* ───────────────────────── connection (cached across hot reloads / invocations) ───────────────────────── */

const g = globalThis as unknown as { __rtxDb?: Promise<Db> };

const gm = globalThis as unknown as { __rtxMemDb?: Db };
/** Separate in-memory demo database (used by the public site if MongoDB is unreachable). */
export function getMemoryDb(): Db {
  return (gm.__rtxMemDb ??= new MemDb());
}

export function dbConfigured() {
  return !!process.env.MONGODB_URI;
}

export function getDb(): Promise<Db> {
  if (!g.__rtxDb) {
    g.__rtxDb = (async () => {
      // tolerate common copy-paste mistakes: spaces/new lines, quotes, or "MONGODB_URI=" pasted into the value
      const uri = (process.env.MONGODB_URI || '')
        .trim()
        .replace(/^MONGODB_URI\s*=\s*/i, '')
        .replace(/^['"`]+|['"`]+$/g, '')
        .replace(/\s+/g, '');
      if (!uri) return getMemoryDb();
      const { MongoClient } = await import('mongodb');
      // database name must be a simple word (no dots, slashes or spaces) — fall back to "realtechx"
      const rawName = (process.env.MONGODB_DB || '').trim().replace(/^['"`]+|['"`]+$/g, '');
      const dbName = /^[A-Za-z0-9_-]{1,60}$/.test(rawName) ? rawName : 'realtechx';
      const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 8000 });
      await client.connect();
      const db = new MongoDb(client.db(dbName));
      ensureIndexes(client.db(dbName)).catch(() => {});
      return db;
    })().catch((e) => {
      g.__rtxDb = undefined; // retry on next request
      throw e;
    });
  }
  return g.__rtxDb;
}

async function ensureIndexes(db: any) {
  const ix = async (c: string, spec: Record<string, 1 | -1>, opts: Record<string, unknown> = {}) => {
    try {
      await db.collection(c).createIndex(spec, opts);
    } catch {
      /* index exists with other options — ignore */
    }
  };
  await Promise.all([
    ix('properties', { slug: 1 }, { unique: true }),
    ix('properties', { publish: 1, city: 1, type: 1 }),
    ix('leads', { createdAt: -1 }),
    ix('leads', { status: 1 }),
    ix('blogs', { slug: 1 }, { unique: true }),
    ix('developers', { slug: 1 }, { unique: true }),
    ix('users', { email: 1 }, { unique: true }),
    ix('activity', { at: -1 }),
    ix('stats_daily', { date: 1 }),
    ix('media', { createdAt: -1 }),
    ix('resets', { expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}

/** Sequential human-friendly ids, e.g. RTX1251, LD-00042 */
export function nextSeq(db: Db, name: string, start = 1): Promise<number> {
  return db.seq(name, start);
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const nowIso = () => new Date().toISOString();
