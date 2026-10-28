/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Admin resource registry: one definition per collection describes permissions, search,
 * validation and side-effects. The generic routes in app/api/admin/[resource] use these.
 */
import type { Db, Doc, Filter, Update } from './db';
import { newId, nowIso, nextSeq } from './db';
import { HttpError, hashPassword, passwordProblem, type SessionUser } from './auth';
import type { Perm } from '../auth/permissions';
import { roles } from '../auth/permissions';
import { navTypes } from '../site';
import { slugify } from './util';
import { str, text, num, optNum, bool, oneOf, list, lines, paragraphs, url, urls, email, phoneE164, seo, required } from './validate';
import { img } from '../data/images';

export interface Ctx {
  db: Db;
  user: SessionUser;
}

export interface Resource {
  coll: string;
  perm: Perm;
  label: string;
  search: string[];
  /** query-string params allowed as exact-match filters */
  filters?: string[];
  sort: Record<string, 1 | -1>;
  /** fields returned in list views (keeps payloads small) */
  listFields?: string[];
  /** changes affect the public website (triggers revalidation) */
  site: boolean;
  readOnly?: boolean;
  noCreate?: boolean;
  noDelete?: boolean;
  extraFilter?(p: URLSearchParams): Filter;
  create?(input: any, ctx: Ctx): Promise<Doc>;
  update?(existing: Doc, input: any, ctx: Ctx): Promise<Update>;
  blockDelete?(doc: Doc, ctx: Ctx): Promise<string | void>;
  afterWrite?(doc: Doc, prev: Doc | null, ctx: Ctx): Promise<void>;
  afterDelete?(doc: Doc, ctx: Ctx): Promise<void>;
  /** strip private fields before sending to the browser */
  out?(doc: Doc): Doc;
  name(doc: Doc): string;
}

const pubStates = ['published', 'draft', 'pending'] as const;

async function uniqueSlug(db: Db, coll: string, base: string, selfId?: string, scope: Filter = {}) {
  let slug = base || newId();
  for (let i = 2; i < 200; i++) {
    const hit = await db.coll(coll).findOne({ ...scope, slug });
    if (!hit || hit._id === selfId) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${newId()}`;
}

/** Turns a doc into a $set without _id. */
const setOf = (d: Doc): Update => {
  const { _id, ...rest } = d;
  void _id;
  return { $set: rest };
};

/* ─────────────────────────── Properties & projects ─────────────────────────── */

const bhkFrom = (labels: string[]) =>
  Array.from(new Set(labels.flatMap((l) => Array.from(l.matchAll(/(\d+(?:\.5)?)\s*BHK/gi), (m) => Math.floor(Number(m[1])))))).sort((a, b) => a - b);

async function propertyDoc(input: any, existing: Doc | null, ctx: Ctx): Promise<Doc> {
  const { db } = ctx;
  const title = required(str(input.title, 140), 'Title');
  const type = oneOf(input.type, navTypes.map((t) => t.slug) as string[], '');
  if (!type) throw new HttpError(422, 'Choose a category.');
  const purpose = oneOf(input.purpose ?? input.listingFor, ['buy', 'rent', 'lease'] as const, 'buy');
  const statusTerms = (await db.coll('terms').find({ group: 'status' })).map((t) => t.slug);
  const status = oneOf(input.status, statusTerms.length ? statusTerms : ['new-launch', 'under-construction', 'ready-to-move'], 'under-construction');

  const citySlug = str(input.city, 80);
  const city = await db.coll('cities').findOne({ slug: citySlug });
  if (!city) throw new HttpError(422, 'Choose a city (add it under Locations first).');
  const locality = required(str(input.locality, 100), 'Locality');
  const localitySlug = slugify(input.localitySlug || locality);

  const developer = str(input.developer, 100);
  if (developer && !(await db.coll('developers').findOne({ slug: developer }))) throw new HttpError(422, 'Selected developer was not found.');

  const configurations = (Array.isArray(input.configurations) ? input.configurations : [])
    .map((c: any) => ({ label: str(c?.label, 60), area: str(c?.area, 60) || 'On request', price: str(c?.price, 60) || 'On request', ...(url(c?.image) ? { image: url(c?.image) } : {}) }))
    .filter((c: any) => c.label)
    .slice(0, 40);
  const bhkInput = Array.isArray(input.bhk) ? input.bhk.map((b: any) => Math.floor(num(b, 0, 20))).filter(Boolean) : [];
  const bhk = bhkInput.length ? bhkInput : bhkFrom(configurations.map((c: any) => c.label));

  let images = urls(input.images, 40);
  const publish = oneOf(input.publish, pubStates, 'draft');
  if (!images.length) {
    if (publish === 'published') throw new HttpError(422, 'Add at least one image before publishing.');
    images = [];
  }
  const priceMin = num(input.priceMin);
  const priceMax = num(input.priceMax);
  if (priceMax && priceMin && priceMax < priceMin) throw new HttpError(422, 'Maximum price cannot be lower than the minimum price.');
  const areaMin = num(input.areaMin, 0, 1e9);
  const areaMax = num(input.areaMax, 0, 1e9) || areaMin;

  const slugBase = slugify(input.slug || `${title} ${locality}`);
  const slug = await uniqueSlug(db, 'properties', slugBase, existing?._id);
  const now = nowIso();
  const wasPublished = existing?.publish === 'published';

  const doc: Doc = {
    _id: existing?._id ?? '',
    id: existing?.id ?? '',
    slug,
    title,
    tagline: str(input.tagline, 200),
    kind: oneOf(input.kind, ['project', 'property'] as const, 'project'),
    publish,
    purpose,
    listingFor: purpose === 'buy' ? 'buy' : 'rent',
    type,
    subType: str(input.subType, 60),
    status,
    city: citySlug,
    locality,
    localitySlug,
    address: str(input.address, 300),
    lat: optNum(input.lat),
    lng: optNum(input.lng),
    mapQuery: str(input.mapQuery, 200) || `${title}, ${locality}, ${city.name}`,
    developer,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    areaUnit: oneOf(input.areaUnit, ['sq.ft', 'sq.yd', 'acre'] as const, 'sq.ft'),
    bhk,
    configurations,
    furnishing: str(input.furnishing, 40),
    possession: str(input.possession, 80) || 'On request',
    landParcel: str(input.landParcel, 80) || 'On request',
    totalUnits: str(input.totalUnits, 80) || 'On request',
    rera: str(input.rera, 120) || 'Verify on RERA portal',
    reraQr: url(input.reraQr),
    images,
    videoUrl: url(input.videoUrl),
    brochureUrl: url(input.brochureUrl),
    amenities: list(input.amenities, 120, 80),
    highlights: lines(input.highlights, 30, 200),
    description: paragraphs(input.description),
    nearby: (Array.isArray(input.nearby) ? input.nearby : [])
      .map((n: any) => ({ name: str(n?.name, 100), distance: str(n?.distance, 40) }))
      .filter((n: any) => n.name)
      .slice(0, 40),
    featured: bool(input.featured),
    source: oneOf(input.source, ['published', 'sample'] as const, 'published'),
    contactPhone: phoneE164(input.contactPhone),
    whatsapp: str(input.whatsapp, 20).replace(/\D/g, ''),
    seo: seo(input.seo),
    views: existing?.views ?? 0,
    postedOn: existing?.postedOn ?? now.slice(0, 10),
    createdAt: existing?.createdAt ?? now,
    createdBy: existing?.createdBy ?? ctx.user.name,
    updatedAt: now,
    updatedBy: ctx.user.name,
    publishedAt: publish === 'published' ? (wasPublished ? existing?.publishedAt ?? now : now) : existing?.publishedAt ?? '',
  };
  if (publish === 'published' && !wasPublished) doc.postedOn = now.slice(0, 10);
  if (!doc.description.length) doc.description = [doc.tagline || `${title} in ${locality}, ${city.name}.`];
  for (const k of ['lat', 'lng'] as const) if (doc[k] === undefined) delete doc[k];
  return doc;
}

const properties: Resource = {
  coll: 'properties',
  perm: 'properties',
  label: 'property',
  search: ['title', 'locality', 'id', 'slug', 'developer', 'rera'],
  filters: ['publish', 'type', 'city', 'status', 'kind', 'purpose', 'developer', 'source'],
  sort: { updatedAt: -1 },
  listFields: ['id', 'slug', 'title', 'type', 'kind', 'purpose', 'listingFor', 'status', 'city', 'locality', 'developer', 'priceMin', 'priceMax', 'publish', 'featured', 'views', 'images', 'updatedAt', 'createdAt', 'source', 'subType'],
  site: true,
  extraFilter: (p) => (p.get('featured') === '1' ? { featured: true } : {}),
  async create(input, ctx) {
    const doc = await propertyDoc(input, null, ctx);
    const n = await nextSeq(ctx.db, 'property', 1001);
    doc._id = doc.id = `RTX${n}`;
    return doc;
  },
  async update(existing, input, ctx) {
    return setOf(await propertyDoc({ ...existing, ...input }, existing, ctx));
  },
  async afterWrite(doc, _prev, { db }) {
    // keep the locality master list in sync (new localities appear in Admin → Locations automatically)
    const exists = await db.coll('localities').findOne({ city: doc.city, slug: doc.localitySlug });
    if (!exists) await db.coll('localities').insertOne({ _id: `${doc.city}/${doc.localitySlug}`, slug: doc.localitySlug, name: doc.locality, city: doc.city, popular: false }).catch(() => {});
  },
  name: (d) => `${d.title} (${d.id})`,
};

/* ─────────────────────────── Leads ─────────────────────────── */

const leadStatuses = ['new', 'contacted', 'qualified', 'closed', 'lost'] as const;

const leads: Resource = {
  coll: 'leads',
  perm: 'leads',
  label: 'lead',
  search: ['leadId', 'name', 'phone', 'email', 'property', 'message', 'source'],
  filters: ['status', 'assignedTo', 'source', 'propertySlug'],
  sort: { createdAt: -1 },
  site: false,
  extraFilter(p) {
    const f: Filter = {};
    const from = p.get('from');
    const to = p.get('to');
    const ist = (d: string, end = false) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T${end ? '23:59:59.999' : '00:00:00'}+05:30`).toISOString() : '');
    if (from || to) f.createdAt = { ...(ist(from || '') ? { $gte: ist(from || '') } : {}), ...(ist(to || '', true) ? { $lte: ist(to || '', true) } : {}) };
    const spam = p.get('spam');
    f.spam = spam === '1' ? true : { $ne: true };
    if (p.get('followup') === 'due') f.followUp = { $gt: '', $lte: new Date().toISOString().slice(0, 10) };
    const prop = p.get('property');
    if (prop) f.property = { $regex: prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    return f;
  },
  async create(input, { db, user }) {
    const name = required(str(input.name, 80), 'Name');
    const phone = required(str(input.phone, 30), 'Phone');
    const n = await nextSeq(db, 'lead', 10001);
    const now = nowIso();
    return {
      _id: `RTX-${n}`,
      leadId: `RTX-${n}`,
      name,
      phone,
      email: email(input.email),
      message: text(input.message, 2000),
      property: str(input.property, 300),
      propertySlug: str(input.propertySlug, 120),
      intent: str(input.intent, 120),
      source: str(input.source, 120) || 'Manual entry',
      page: '',
      status: oneOf(input.status, leadStatuses, 'new'),
      assignedTo: str(input.assignedTo, 40),
      followUp: str(input.followUp, 10),
      notes: input.note ? [{ at: now, by: user.name, text: text(input.note, 2000) }] : [],
      spam: false,
      createdAt: now,
      updatedAt: now,
    };
  },
  async update(existing, input, { user }) {
    const $set: Record<string, any> = { updatedAt: nowIso() };
    if (input.status !== undefined) $set.status = oneOf(input.status, leadStatuses, existing.status);
    if (input.assignedTo !== undefined) $set.assignedTo = str(input.assignedTo, 40);
    if (input.followUp !== undefined) $set.followUp = /^\d{4}-\d{2}-\d{2}$/.test(input.followUp) ? input.followUp : '';
    if (input.spam !== undefined) $set.spam = bool(input.spam);
    for (const k of ['name', 'phone', 'property', 'source'] as const) if (input[k] !== undefined) $set[k] = str(input[k], 300) || existing[k];
    if (input.email !== undefined) $set.email = email(input.email);
    const u: Update = { $set };
    if (input.note) u.$push = { notes: { at: nowIso(), by: user.name, text: text(input.note, 2000) } };
    return u;
  },
  name: (d) => `${d.leadId} ${d.name}`,
};

/* ─────────────────────────── Developers ─────────────────────────── */

async function developerDoc(input: any, existing: Doc | null, { db }: Ctx): Promise<Doc> {
  const name = required(str(input.name, 120), 'Developer name');
  const slug = await uniqueSlug(db, 'developers', slugify(input.slug || name), existing?._id);
  return {
    _id: existing?._id ?? slug,
    slug,
    name,
    city: str(input.city, 80),
    established: Math.floor(num(input.established, 0, 2100)),
    tagline: str(input.tagline, 200),
    about: text(input.about, 6000),
    specialties: list(input.specialties, 12, 60),
    cover: url(input.cover) || img.commercial[5],
    logo: url(input.logo),
    phone: str(input.phone, 30),
    email: email(input.email),
    website: url(input.website),
    real: bool(input.real),
    publish: oneOf(input.publish, pubStates, 'published'),
    seo: seo(input.seo),
    updatedAt: nowIso(),
  };
}

const developers: Resource = {
  coll: 'developers',
  perm: 'developers',
  label: 'developer',
  search: ['name', 'slug', 'tagline'],
  filters: ['city', 'publish'],
  sort: { name: 1 },
  site: true,
  create: (input, ctx) => developerDoc(input, null, ctx),
  async update(existing, input, ctx) {
    return setOf(await developerDoc({ ...existing, ...input }, existing, ctx));
  },
  async afterWrite(doc, prev, { db }) {
    if (prev && prev.slug !== doc.slug) await db.coll('properties').updateMany({ developer: prev.slug }, { $set: { developer: doc.slug } });
  },
  async blockDelete(doc, { db }) {
    const n = await db.coll('properties').count({ developer: doc.slug });
    if (n) return `${n} propert${n === 1 ? 'y uses' : 'ies use'} this developer. Reassign or delete them first.`;
  },
  name: (d) => d.name,
};

/* ─────────────────────────── Locations ─────────────────────────── */

const states: Resource = {
  coll: 'states',
  perm: 'locations',
  label: 'state',
  search: ['name'],
  sort: { name: 1 },
  site: true,
  async create(input, { db }) {
    const name = required(str(input.name, 80), 'State name');
    const slug = await uniqueSlug(db, 'states', slugify(name));
    return { _id: slug, slug, name, reraName: str(input.reraName, 120), reraUrl: url(input.reraUrl) };
  },
  async update(existing, input, { db }) {
    const name = required(str(input.name ?? existing.name, 80), 'State name');
    if (name !== existing.name) await db.coll('cities').updateMany({ state: existing.name }, { $set: { state: name } });
    return { $set: { name, reraName: str(input.reraName ?? existing.reraName, 120), reraUrl: url(input.reraUrl ?? existing.reraUrl) } };
  },
  async blockDelete(doc, { db }) {
    const n = await db.coll('cities').count({ $or: [{ stateSlug: doc.slug }, { state: doc.name }] });
    if (n) return `${n} cit${n === 1 ? 'y is' : 'ies are'} in this state. Move or delete them first.`;
  },
  name: (d) => d.name,
};

async function cityDoc(input: any, existing: Doc | null, { db }: Ctx): Promise<Doc> {
  const name = required(str(input.name, 80), 'City name');
  const stateSlug = str(input.stateSlug, 80);
  const st = await db.coll('states').findOne({ slug: stateSlug });
  if (!st) throw new HttpError(422, 'Choose a state.');
  const slug = await uniqueSlug(db, 'cities', slugify(input.slug || name), existing?._id);
  return {
    _id: existing?._id ?? slug,
    slug,
    name,
    state: st.name,
    stateSlug,
    image: url(input.image) || img.hero,
    blurb: text(input.blurb, 600),
    popular: bool(input.popular),
    order: Math.floor(num(input.order, 0, 9999)),
    seo: seo(input.seo),
  };
}

const cities: Resource = {
  coll: 'cities',
  perm: 'locations',
  label: 'city',
  search: ['name', 'state'],
  filters: ['stateSlug'],
  sort: { order: 1, name: 1 },
  site: true,
  create: (input, ctx) => cityDoc(input, null, ctx),
  async update(existing, input, ctx) {
    return setOf(await cityDoc({ ...existing, ...input }, existing, ctx));
  },
  async afterWrite(doc, prev, { db }) {
    if (prev && prev.slug !== doc.slug) {
      await Promise.all([
        db.coll('properties').updateMany({ city: prev.slug }, { $set: { city: doc.slug } }),
        db.coll('localities').updateMany({ city: prev.slug }, { $set: { city: doc.slug } }),
        db.coll('developers').updateMany({ city: prev.slug }, { $set: { city: doc.slug } }),
      ]);
    }
  },
  async blockDelete(doc, { db }) {
    const n = await db.coll('properties').count({ city: doc.slug });
    if (n) return `${n} propert${n === 1 ? 'y is' : 'ies are'} listed in this city. Move or delete them first.`;
  },
  async afterDelete(doc, { db }) {
    await db.coll('localities').deleteMany({ city: doc.slug });
  },
  name: (d) => d.name,
};

async function localityDoc(input: any, existing: Doc | null, { db }: Ctx): Promise<Doc> {
  const name = required(str(input.name, 100), 'Locality name');
  const city = str(input.city, 80);
  if (!(await db.coll('cities').findOne({ slug: city }))) throw new HttpError(422, 'Choose a city.');
  const slug = await uniqueSlug(db, 'localities', slugify(input.slug || name), existing?._id, { city });
  return {
    _id: existing?._id ?? `${city}/${slug}`,
    slug,
    name,
    city,
    image: url(input.image),
    about: text(input.about, 4000),
    popular: bool(input.popular),
    seo: seo(input.seo),
  };
}

const localities: Resource = {
  coll: 'localities',
  perm: 'locations',
  label: 'locality',
  search: ['name', 'slug'],
  filters: ['city'],
  sort: { city: 1, name: 1 },
  site: true,
  extraFilter: (p) => (p.get('popular') === '1' ? { popular: true } : {}),
  create: (input, ctx) => localityDoc(input, null, ctx),
  async update(existing, input, ctx) {
    return setOf(await localityDoc({ ...existing, ...input }, existing, ctx));
  },
  async afterWrite(doc, prev, { db }) {
    if (prev && (prev.slug !== doc.slug || prev.name !== doc.name || prev.city !== doc.city)) {
      await db.coll('properties').updateMany({ city: prev.city, localitySlug: prev.slug }, { $set: { city: doc.city, localitySlug: doc.slug, locality: doc.name } });
    }
  },
  async blockDelete(doc, { db }) {
    const n = await db.coll('properties').count({ city: doc.city, localitySlug: doc.slug });
    if (n) return `${n} propert${n === 1 ? 'y is' : 'ies are'} in this locality. Move or delete them first.`;
  },
  name: (d) => `${d.name} (${d.city})`,
};

/* ─────────────────────────── Categories, types, amenities … ─────────────────────────── */

const termGroups = ['purpose', 'category', 'subtype', 'amenity', 'furnishing', 'status'] as const;
/** groups whose slugs are wired into URLs / logic — only labels & order are editable */
const systemGroups = ['purpose', 'category', 'status'];

const terms: Resource = {
  coll: 'terms',
  perm: 'taxonomy',
  label: 'term',
  search: ['label', 'slug'],
  filters: ['group', 'parent'],
  sort: { group: 1, order: 1, label: 1 },
  site: true,
  async create(input, { db }) {
    const group = oneOf(input.group, termGroups, 'amenity');
    if (systemGroups.includes(group)) throw new HttpError(422, 'This group is fixed (it powers the website URLs). You can rename its items instead.');
    const label = required(str(input.label, 80), 'Name');
    const slug = slugify(input.slug || label);
    if (await db.coll('terms').findOne({ group, slug })) throw new HttpError(409, `“${label}” already exists.`);
    const last = await db.coll('terms').find({ group }, { sort: { order: -1 }, limit: 1 });
    return { _id: `${group}:${slug}`, group, slug, label, parent: str(input.parent, 40), order: Math.floor(num(input.order ?? (last[0]?.order ?? 0) + 1, 0, 9999)) };
  },
  async update(existing, input) {
    return { $set: { label: required(str(input.label ?? existing.label, 80), 'Name'), parent: str(input.parent ?? existing.parent, 40), order: Math.floor(num(input.order ?? existing.order, 0, 9999)) } };
  },
  async blockDelete(doc) {
    if (systemGroups.includes(doc.group)) return 'Built-in items cannot be deleted (they power website URLs and filters).';
  },
  name: (d) => `${d.group}: ${d.label}`,
};

/* ─────────────────────────── Blogs ─────────────────────────── */

async function blogDoc(input: any, existing: Doc | null, { db, user }: Ctx): Promise<Doc> {
  const title = required(str(input.title, 160), 'Title');
  const slug = await uniqueSlug(db, 'blogs', slugify(input.slug || title), existing?._id);
  const sections = (Array.isArray(input.sections) ? input.sections : [])
    .map((sec: any) => ({ heading: str(sec?.heading, 160), body: paragraphs(sec?.body) }))
    .filter((sec: any) => sec.heading || sec.body.length)
    .slice(0, 40);
  const publish = oneOf(input.publish, pubStates, 'draft');
  const cover = url(input.cover);
  if (publish === 'published' && !cover) throw new HttpError(422, 'Add a cover image before publishing.');
  if (publish === 'published' && !sections.length) throw new HttpError(422, 'Write at least one section before publishing.');
  const words = sections.reduce((n: number, sec: any) => n + sec.body.join(' ').split(/\s+/).length, 0);
  return {
    _id: existing?._id ?? slug,
    slug,
    title,
    excerpt: str(input.excerpt, 400),
    category: str(input.category, 60) || 'Guides',
    date: /^\d{4}-\d{2}-\d{2}$/.test(input.date) ? input.date : nowIso().slice(0, 10),
    readTime: `${Math.max(1, Math.round(words / 200))} min read`,
    cover: cover || img.apartment[0],
    sections,
    city: str(input.city, 80),
    author: str(input.author, 80) || user.name,
    publish,
    seo: seo(input.seo),
    updatedAt: nowIso(),
  };
}

const blogs: Resource = {
  coll: 'blogs',
  perm: 'blogs',
  label: 'blog post',
  search: ['title', 'excerpt', 'category', 'slug'],
  filters: ['publish', 'category', 'city'],
  sort: { date: -1 },
  listFields: ['slug', 'title', 'category', 'date', 'publish', 'cover', 'author', 'readTime', 'updatedAt'],
  site: true,
  create: (input, ctx) => blogDoc(input, null, ctx),
  async update(existing, input, ctx) {
    return setOf(await blogDoc({ ...existing, ...input }, existing, ctx));
  },
  name: (d) => d.title,
};

/* ─────────────────────────── SEO overrides for static routes ─────────────────────────── */

const seoRes: Resource = {
  coll: 'seo',
  perm: 'seo',
  label: 'SEO entry',
  search: ['_id', 'title'],
  sort: { _id: 1 },
  site: true,
  async create(input) {
    const route = str(input.route ?? input._id, 200);
    if (!route.startsWith('/')) throw new HttpError(422, 'Route must start with /');
    return { _id: route, ...seo(input) };
  },
  async update(_existing, input) {
    return { $set: seo(input) };
  },
  name: (d) => d._id,
};

/* ─────────────────────────── Media library ─────────────────────────── */

const media: Resource = {
  coll: 'media',
  perm: 'media',
  label: 'media',
  search: ['name', 'alt', 'folder'],
  filters: ['folder', 'resourceType'],
  sort: { createdAt: -1 },
  site: false,
  async create(input, { user }) {
    const u = url(input.url);
    if (!u) throw new HttpError(422, 'A valid file URL is required.');
    return {
      _id: newId(),
      url: u,
      publicId: str(input.publicId, 300),
      resourceType: oneOf(input.resourceType, ['image', 'video', 'raw'] as const, 'image'),
      folder: slugify(input.folder) || 'general',
      name: str(input.name, 200) || u.split('/').pop()?.split('?')[0] || 'file',
      alt: str(input.alt, 200),
      bytes: Math.floor(num(input.bytes, 0, 1e10)),
      width: Math.floor(num(input.width, 0, 1e5)),
      height: Math.floor(num(input.height, 0, 1e5)),
      format: str(input.format, 20),
      createdAt: nowIso(),
      createdBy: user.name,
    };
  },
  async update(existing, input) {
    return { $set: { name: str(input.name ?? existing.name, 200), alt: str(input.alt ?? existing.alt, 200), folder: slugify(input.folder ?? existing.folder) || 'general' } };
  },
  name: (d) => d.name,
};

/* ─────────────────────────── Admin users ─────────────────────────── */

const users: Resource = {
  coll: 'users',
  perm: 'users',
  label: 'user',
  search: ['name', 'email'],
  filters: ['role'],
  sort: { createdAt: 1 },
  site: false,
  out: (u) => {
    const { passwordHash, ...rest } = u;
    void passwordHash;
    return rest as Doc;
  },
  async create(input, { db }) {
    const name = required(str(input.name, 80), 'Name');
    const em = required(email(input.email), 'Email');
    if (await db.coll('users').findOne({ email: em })) throw new HttpError(409, 'A user with this email already exists.');
    const pw = String(input.password || '');
    const problem = passwordProblem(pw);
    if (problem) throw new HttpError(422, problem);
    return {
      _id: newId(),
      name,
      email: em,
      phone: str(input.phone, 20),
      role: oneOf(input.role, roles, 'lead_manager'),
      active: input.active === undefined ? true : bool(input.active),
      passwordHash: await hashPassword(pw),
      sessionVersion: 1,
      createdAt: nowIso(),
    };
  },
  async update(existing, input, { db, user }) {
    const $set: Record<string, any> = { updatedAt: nowIso() };
    const $inc: Record<string, number> = {};
    if (input.name !== undefined) $set.name = required(str(input.name, 80), 'Name');
    if (input.phone !== undefined) $set.phone = str(input.phone, 20);
    if (input.email !== undefined) {
      const em = required(email(input.email), 'Email');
      const other = await db.coll('users').findOne({ email: em });
      if (other && other._id !== existing._id) throw new HttpError(409, 'A user with this email already exists.');
      $set.email = em;
    }
    const role = input.role !== undefined ? oneOf(input.role, roles, existing.role) : existing.role;
    const active = input.active !== undefined ? bool(input.active) : existing.active;
    if (existing._id === user.id && (role !== 'super_admin' || !active)) throw new HttpError(422, 'You cannot remove your own Super Admin access.');
    if (existing.role === 'super_admin' && (role !== 'super_admin' || !active)) {
      const others = await db.coll('users').count({ role: 'super_admin', active: true, _id: { $ne: existing._id } });
      if (!others) throw new HttpError(422, 'At least one active Super Admin is required.');
    }
    $set.role = role;
    $set.active = active;
    if (role !== existing.role || active !== existing.active) $inc.sessionVersion = 1; // force re-login with new rights
    if (input.password) {
      const problem = passwordProblem(String(input.password));
      if (problem) throw new HttpError(422, problem);
      $set.passwordHash = await hashPassword(String(input.password));
      $inc.sessionVersion = 1;
    }
    if (input.logoutEverywhere) $inc.sessionVersion = 1;
    return Object.keys($inc).length ? { $set, $inc } : { $set };
  },
  async blockDelete(doc, { db, user }) {
    if (doc._id === user.id) return 'You cannot delete your own account.';
    if (doc.role === 'super_admin') {
      const others = await db.coll('users').count({ role: 'super_admin', active: true, _id: { $ne: doc._id } });
      if (!others) return 'At least one active Super Admin is required.';
    }
  },
  name: (d) => `${d.name} <${d.email}>`,
};

/* ─────────────────────────── Activity log (read-only) ─────────────────────────── */

const activity: Resource = {
  coll: 'activity',
  perm: 'activity',
  label: 'activity',
  search: ['userName', 'action', 'entity', 'summary', 'entityId'],
  filters: ['entity', 'action', 'userId'],
  sort: { at: -1 },
  site: false,
  readOnly: true,
  name: (d) => d.action,
};

export const resources: Record<string, Resource> = {
  properties,
  leads,
  developers,
  states,
  cities,
  localities,
  terms,
  blogs,
  seo: seoRes,
  media,
  users,
  activity,
};

export function resourceOf(name: string) {
  const r = resources[name];
  if (!r) throw new HttpError(404, 'Unknown resource');
  return r;
}
