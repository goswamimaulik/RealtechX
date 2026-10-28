/**
 * Read-side data for the public website. Everything is loaded from the database
 * (MongoDB, or the in-memory demo store) and memoised for a short time per server instance.
 * Admin saves call `invalidateStore()` + `revalidatePath('/', 'layout')` so changes appear immediately.
 */
import { getDb, getMemoryDb, type Db } from './db';
import { ensureSeeded, defaultSettings } from './seed';
import { toCard } from '../card';
import type { BlogPost, City, Developer, Locality, Property, SeoFields, SiteSettings, State, Term } from '../types';
import { defaultAbout, defaultContact, defaultFooter, defaultHome, type AboutContent, type ContactContent, type FooterContent, type HomeContent } from '../content-defaults';

export interface LegalPage { slug: string; title: string; updated: string; sections: { h: string; p: string[] }[] }

export interface Store {
  settings: SiteSettings;
  properties: Property[]; // published only
  developers: Developer[];
  states: State[];
  cities: City[];
  localities: Locality[];
  terms: Term[];
  blogs: BlogPost[]; // published only, newest first
  home: HomeContent;
  about: AboutContent;
  contact: ContactContent;
  footer: FooterContent;
  legal: Record<string, LegalPage>;
  seoPages: Record<string, SeoFields>;
}

const TTL_MS = 15_000;
const g = globalThis as unknown as { __rtxStore?: { at: number; p: Promise<Store> } };

/* eslint-disable @typescript-eslint/no-explicit-any */
const strip = <T,>(d: any): T => {
  if (!d) return d;
  const { _id, ...rest } = d;
  void _id;
  return rest as T;
};

async function load(): Promise<Store> {
  let db: Db;
  try {
    db = await getDb();
  } catch (e) {
    // MongoDB unreachable / misconfigured: keep the public site online with the demo data
    console.error('[store] database unavailable, serving demo data', e);
    db = getMemoryDb();
  }
  await ensureSeeded(db);
  const [settings, props, devs, states, cities, locs, terms, blogs, content, seo] = await Promise.all([
    db.coll('settings').findOne({ _id: 'site' }),
    db.coll('properties').find({ publish: 'published' }, { sort: { postedOn: -1 } }),
    db.coll('developers').find({ publish: { $ne: 'draft' } }, { sort: { name: 1 } }),
    db.coll('states').find({}, { sort: { name: 1 } }),
    db.coll('cities').find({}, { sort: { order: 1, name: 1 } }),
    db.coll('localities').find({}, { sort: { name: 1 } }),
    db.coll('terms').find({}, { sort: { order: 1 } }),
    db.coll('blogs').find({ publish: 'published' }, { sort: { date: -1 } }),
    db.coll('content').find({}),
    db.coll('seo').find({}),
  ]);
  const byId = Object.fromEntries(content.map((c) => [c._id, c]));
  const legal: Record<string, LegalPage> = {};
  content.filter((c) => String(c._id).startsWith('legal:')).forEach((c) => (legal[c.slug] = strip<LegalPage>(c)));
  return {
    settings: { ...defaultSettings, ...strip<SiteSettings>(settings) },
    properties: props.map((p) => strip<Property>(p)),
    developers: devs.map((d) => strip<Developer>(d)),
    states: states.map((s) => strip<State>(s)),
    cities: cities.map((c) => strip<City>(c)),
    localities: locs.map((l) => strip<Locality>(l)),
    terms: terms.map((t) => strip<Term>(t)),
    blogs: blogs.map((b) => strip<BlogPost>(b)),
    home: { ...defaultHome, ...strip<HomeContent>(byId.home) },
    about: { ...defaultAbout, ...strip<AboutContent>(byId.about) },
    contact: { ...defaultContact, ...strip<ContactContent>(byId.contact) },
    footer: { ...defaultFooter, ...strip<FooterContent>(byId.footer) },
    legal,
    seoPages: Object.fromEntries(seo.map((s) => [s._id, strip<SeoFields>(s)])),
  };
}

export function getStore(): Promise<Store> {
  const now = Date.now();
  if (!g.__rtxStore || now - g.__rtxStore.at > TTL_MS) {
    const p = load();
    g.__rtxStore = { at: now, p };
    p.catch(() => {
      if (g.__rtxStore?.p === p) g.__rtxStore = undefined;
    });
  }
  return g.__rtxStore.p;
}

export function invalidateStore() {
  g.__rtxStore = undefined;
}

/* ───────────── helpers used by pages (all operate on a loaded store) ───────────── */

export const cityOf = (s: Store, slug: string) => s.cities.find((c) => c.slug === slug);
export const developerOf = (s: Store, slug: string) => s.developers.find((d) => d.slug === slug);
export const propertyOf = (s: Store, slug: string) => s.properties.find((p) => p.slug === slug);
export const blogOf = (s: Store, slug: string) => s.blogs.find((b) => b.slug === slug);
export const stateOf = (s: Store, name: string) => s.states.find((x) => x.name === name || x.slug === name);

export function localitiesIn(s: Store, city: string) {
  // localities that have at least one published listing (keeps empty pages out of menus & sitemap)
  const used = new Set(s.properties.filter((p) => p.city === city).map((p) => p.localitySlug));
  const fromMaster = s.localities.filter((l) => l.city === city && used.has(l.slug)).map((l) => ({ slug: l.slug, name: l.name }));
  const known = new Set(fromMaster.map((l) => l.slug));
  const extra = s.properties
    .filter((p) => p.city === city && !known.has(p.localitySlug))
    .reduce((m, p) => m.set(p.localitySlug, p.locality), new Map<string, string>());
  return [...fromMaster, ...Array.from(extra, ([slug, name]) => ({ slug, name }))];
}

export function allLocalitiesIn(s: Store) {
  return s.cities.flatMap((c) => localitiesIn(s, c.slug).map((l) => ({ ...l, city: c.slug })));
}

export function filterBy(s: Store, f: { type?: string; city?: string; locality?: string; status?: string; developer?: string; listingFor?: string }) {
  return s.properties.filter(
    (p) =>
      (!f.type || p.type === f.type) &&
      (!f.city || p.city === f.city) &&
      (!f.locality || p.localitySlug === f.locality) &&
      (!f.status || p.status === f.status) &&
      (!f.developer || p.developer === f.developer) &&
      (!f.listingFor || p.listingFor === f.listingFor),
  );
}

export function reraFor(s: Store, stateName: string) {
  const st = stateOf(s, stateName);
  return st?.reraUrl ? { name: st.reraName || `${st.name} RERA`, url: st.reraUrl } : undefined;
}

/** Public settings that client components need (no secrets). */
export function publicSettings(s: Store) {
  const { name, phone, phoneRaw, whatsapp, email, enquiryCta, logoUrl } = s.settings;
  return { name, phone, phoneRaw, whatsapp, email, enquiryCta, logoUrl: logoUrl ?? '' };
}
export type PublicSettings = ReturnType<typeof publicSettings>;

export const cardOf = (s: Store, p: Property) => toCard(p, { city: cityOf(s, p.city)?.name, developer: developerOf(s, p.developer)?.name });
export const cardsOf = (s: Store, list: Property[]) => list.map((p) => cardOf(s, p));
