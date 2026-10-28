import type { Db, Doc } from './db';
import { nowIso } from './db';
import { properties, allLocalities } from '../data/properties';
import { developers } from '../data/developers';
import { cities } from '../data/cities';
import { blogs } from '../data/blogs';
import { legalPages } from '../data/legal';
import { amenitiesByType } from '../data/build';
import { site, reraPortals, navTypes, statuses } from '../site';
import { slugify } from '../format';
import { defaultAbout, defaultContact, defaultFooter, defaultHome } from '../content-defaults';
import type { SiteSettings } from '../types';

export const defaultSettings: SiteSettings = {
  name: site.name,
  tagline: site.tagline,
  description: site.description,
  url: site.url,
  logoUrl: '',
  faviconUrl: '',
  currency: 'INR',
  phone: site.phone,
  phoneRaw: site.phoneRaw,
  whatsapp: site.whatsapp,
  email: site.email,
  address: site.address,
  hours: site.hours,
  enquiryCta: 'Get Best Price',
  previewNotice: site.previewNotice,
  previewNoticeShort: site.previewNoticeShort,
  showPreviewBar: true,
  social: { ...site.social, twitter: '#' },
  notify: { enabled: true, emails: site.email },
  analytics: { gaId: '', gscVerification: '' },
  maps: { apiKey: '', defaultZoom: 13 },
  uploads: { maxMb: 8, types: 'jpg,jpeg,png,webp,avif,pdf,mp4' },
  cookie: { enabled: false, text: 'We use cookies to improve your experience. By using this site you agree to our Cookie Policy.' },
  seo: {
    titleTemplate: '%s | RealtechX',
    defaultTitle: 'RealtechX — Premium Real Estate Portal | Buy, Rent & Sell Property in India',
    defaultDescription: site.description,
    ogImage: '',
    keywords: 'real estate portal, property in Mumbai, flats in Pune, villas in Bangalore, plots in Hyderabad, property in Gurugram, new launch projects',
    indexing: true,
  },
  security: { sessionMinutes: 60, maxLoginAttempts: 5 },
};

const subtypes: [string, string][] = [
  ['Apartment', 'residential'], ['Penthouse', 'residential'], ['Builder Floor', 'residential'], ['Independent House', 'residential'],
  ['Villa', 'villa'], ['Row House', 'villa'],
  ['Office', 'commercial'], ['Shop', 'commercial'], ['Showroom', 'commercial'], ['Warehouse', 'commercial'], ['Co-working', 'commercial'],
  ['Residential Plot', 'plot'], ['Commercial Plot', 'plot'],
  ['Agricultural Land', 'land'], ['NA Land', 'land'], ['Industrial Land', 'land'],
];

export function buildSeed(): Record<string, Doc[]> {
  const now = nowIso();
  const stateNames = Array.from(new Set(cities.map((c) => c.state)));
  const allAmenities = Array.from(new Set([...Object.values(amenitiesByType).flat(), 'Lift', 'Parking', 'Security', 'Gym', 'Swimming Pool']));
  const terms: Doc[] = [
    ...[['buy', 'Buy'], ['rent', 'Rent'], ['lease', 'Lease']].map(([slug, label], i) => ({ _id: `purpose:${slug}`, group: 'purpose', slug, label, order: i })),
    ...navTypes.map((t, i) => ({ _id: `category:${t.slug}`, group: 'category', slug: t.slug, label: t.label, order: i })),
    ...subtypes.map(([label, parent], i) => ({ _id: `subtype:${slugify(label)}`, group: 'subtype', slug: slugify(label), label, parent, order: i })),
    ...allAmenities.map((label, i) => ({ _id: `amenity:${slugify(label)}`, group: 'amenity', slug: slugify(label), label, order: i })),
    ...['Furnished', 'Semi-furnished', 'Unfurnished'].map((label, i) => ({ _id: `furnishing:${slugify(label)}`, group: 'furnishing', slug: slugify(label), label, order: i })),
    ...statuses.map((s, i) => ({ _id: `status:${s.slug}`, group: 'status', slug: s.slug, label: s.label, order: i })),
  ];
  return {
    settings: [{ _id: 'site', ...defaultSettings }],
    content: [
      { _id: 'home', ...defaultHome },
      { _id: 'about', ...defaultAbout },
      { _id: 'contact', ...defaultContact },
      { _id: 'footer', ...defaultFooter },
      ...Object.entries(legalPages).map(([slug, p]) => ({ _id: `legal:${slug}`, slug, ...p })),
    ],
    states: stateNames.map((name) => ({ _id: slugify(name), slug: slugify(name), name, reraName: reraPortals[name]?.name ?? '', reraUrl: reraPortals[name]?.url ?? '' })),
    cities: cities.map((c, i) => ({ _id: c.slug, ...c, stateSlug: slugify(c.state), popular: true, order: i })),
    localities: allLocalities().map((l) => ({ _id: `${l.city}/${l.slug}`, slug: l.slug, name: l.name, city: l.city, popular: false })),
    developers: developers.map((d) => ({ _id: d.slug, ...d, publish: 'published' })),
    properties: properties.map((p) => ({
      _id: p.id,
      ...p,
      kind: p.listingFor === 'rent' || p.type === 'land' ? 'property' : 'project',
      publish: 'published',
      purpose: p.listingFor,
      views: 0,
      createdAt: `${p.postedOn}T10:00:00.000Z`,
      updatedAt: `${p.postedOn}T10:00:00.000Z`,
      publishedAt: `${p.postedOn}T10:00:00.000Z`,
      createdBy: 'seed',
    })),
    blogs: blogs.map((b) => ({ _id: b.slug, ...b, publish: 'published', author: 'RealtechX Team', updatedAt: now })),
    terms,
    seo: [],
  };
}

/** Seeds an empty database once (first run). Returns true if it seeded. */
export async function ensureSeeded(db: Db): Promise<boolean> {
  const settings = db.coll('settings');
  if (await settings.findOne({ _id: 'site' })) return false;
  const seed = buildSeed();
  for (const [name, docs] of Object.entries(seed)) {
    if (name === 'settings') continue;
    const c = db.coll(name);
    try {
      if ((await c.count({})) === 0) await c.insertMany(docs);
    } catch {
      /* another instance seeded at the same moment — duplicates are rejected, that's fine */
    }
  }
  await db.coll('counters').updateOne({ _id: 'property' }, { $set: { seq: 1000 + properties.length } }, { upsert: true });
  // settings last = "seed complete" marker
  await settings.updateOne({ _id: 'site' }, { $set: seed.settings[0] }, { upsert: true });
  return true;
}
