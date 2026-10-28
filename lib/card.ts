import type { CardProperty, Property } from './types';

/** Strip a listing down to what cards and listing pages need (keeps client payloads small). */
export function toCard(p: Property, names?: { city?: string; developer?: string }): CardProperty {
  return {
    id: p.id, slug: p.slug, title: p.title, tagline: p.tagline, type: p.type, listingFor: p.listingFor, status: p.status,
    city: p.city, locality: p.locality, localitySlug: p.localitySlug, developer: p.developer, priceMin: p.priceMin, priceMax: p.priceMax,
    areaMin: p.areaMin, areaMax: p.areaMax, areaUnit: p.areaUnit, bhk: p.bhk, possession: p.possession, featured: p.featured,
    postedOn: p.postedOn, source: p.source, contactPhone: p.contactPhone, whatsapp: p.whatsapp,
    image: p.images[0], configLabels: Array.from(new Set(p.configurations.map((c) => c.label))),
    cityName: names?.city ?? p.city, developerName: names?.developer ?? p.developer,
  };
}
