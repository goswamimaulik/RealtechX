import type { Property, CardProperty } from '../types';
import { buildHandpicked } from './handpicked';
import { buildReal } from './real-projects';
import { buildGenerated } from './generated';

const handpicked = buildHandpicked();
const real = buildReal();
export const properties: Property[] = [...handpicked, ...real, ...buildGenerated([...handpicked, ...real])];

/** Strip a listing down to what cards and listing pages need (keeps client payloads small). */
export function toCard(p: Property): CardProperty {
  return {
    id: p.id, slug: p.slug, title: p.title, tagline: p.tagline, type: p.type, listingFor: p.listingFor, status: p.status,
    city: p.city, locality: p.locality, localitySlug: p.localitySlug, developer: p.developer, priceMin: p.priceMin, priceMax: p.priceMax,
    areaMin: p.areaMin, areaMax: p.areaMax, areaUnit: p.areaUnit, bhk: p.bhk, possession: p.possession, featured: p.featured,
    postedOn: p.postedOn, source: p.source, contactPhone: p.contactPhone, whatsapp: p.whatsapp,
    image: p.images[0], configLabels: Array.from(new Set(p.configurations.map((c) => c.label))),
  };
}
export const toCards = (list: Property[]) => list.map(toCard);

export const getProperty = (slug: string) => properties.find((p) => p.slug === slug);

export function filterProperties(f: {
  type?: string;
  city?: string;
  locality?: string;
  status?: string;
  developer?: string;
  listingFor?: string;
}) {
  return properties.filter(
    (p) =>
      (!f.type || p.type === f.type) &&
      (!f.city || p.city === f.city) &&
      (!f.locality || p.localitySlug === f.locality) &&
      (!f.status || p.status === f.status) &&
      (!f.developer || p.developer === f.developer) &&
      (!f.listingFor || p.listingFor === f.listingFor),
  );
}

export function localitiesOf(city: string) {
  const map = new Map<string, string>();
  properties.filter((p) => p.city === city).forEach((p) => map.set(p.localitySlug, p.locality));
  return Array.from(map, ([slug, name]) => ({ slug, name }));
}

export function allLocalities() {
  const map = new Map<string, { city: string; slug: string; name: string }>();
  properties.forEach((p) => map.set(p.city + '/' + p.localitySlug, { city: p.city, slug: p.localitySlug, name: p.locality }));
  return Array.from(map.values());
}
