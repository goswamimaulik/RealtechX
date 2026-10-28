import type { Property, PropertyType, ProjectStatus } from '../types';
import { img, pick } from './images';
import { make } from './build';
import { getCity } from './cities';
import { getDeveloper } from './developers';
import { formatINR } from '../format';

/**
 * Real projects by well-known developers.
 * Only details published by the developer / major property portals are used (Oct 2026).
 * Anything not published is shown as "On request". Images are representative stock photos.
 * Price: 0 = on request. priceMax 0 = "onwards". Area: 0 = on request.
 */
type R = {
  title: string;
  dev: string;
  city: string;
  locality: string;
  type?: PropertyType;
  status: ProjectStatus;
  bhk: number[];
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  configs?: { label: string; area?: string; price?: string }[];
  possession?: string;
  rera?: string;
  facts?: string[];
  featured?: boolean;
};

const Cr = 1e7;
const L = 1e5;

const list: R[] = [
  // ── Mumbai ──
  { title: 'Godrej Trilogy', dev: 'godrej-properties', city: 'mumbai', locality: 'Worli', status: 'new-launch', bhk: [3, 4], priceMin: 20.12 * Cr, priceMax: 31.61 * Cr,
    configs: [{ label: '3 BHK', price: '₹20.12 Cr' }, { label: '4 BHK', price: '₹31.28 – 31.61 Cr' }], possession: 'Dec 2033 (RERA)', rera: 'PR1171012501267', featured: true,
    facts: ['Sea-facing address in Worli', 'Two RERA registrations (PR1171012501267, PR1171012501309)'] },
  { title: 'Raymond Invictus by GS', dev: 'raymond-realty', city: 'mumbai', locality: 'Bandra East', status: 'new-launch', bhk: [3, 4], priceMin: 6.84 * Cr, priceMax: 11.98 * Cr,
    configs: [{ label: '3 BHK', price: '₹6.84 Cr onwards' }, { label: '4 BHK', price: '₹10.08 – 11.98 Cr' }], possession: 'Dec 2030 (RERA)', rera: 'PR1180002501495' },
  { title: 'L&T Island Cove', dev: 'lt-realty', city: 'mumbai', locality: 'Mahim West', status: 'under-construction', bhk: [2, 3], priceMin: 3.5 * Cr, priceMax: 6.7 * Cr,
    configs: [{ label: '2 BHK', price: '₹3.50 – 4.07 Cr' }, { label: '3 BHK', price: '₹4.50 – 6.70 Cr' }], possession: 'Jun 2028 (RERA)', rera: 'P51900046369' },
  { title: 'Lodha Divino', dev: 'lodha', city: 'mumbai', locality: 'Matunga', status: 'under-construction', bhk: [2, 3], priceMin: 3.59 * Cr,
    facts: ['New towers launched; earlier towers under construction'] },

  // ── Navi Mumbai ──
  { title: 'Gami Avant', dev: 'gami-group', city: 'navi-mumbai', locality: 'Vashi', status: 'new-launch', bhk: [2, 3, 4], priceMin: 1.54 * Cr, possession: 'Dec 2029' },

  // ── Pune ──
  { title: 'Lodha Belmondo', dev: 'lodha', city: 'pune', locality: 'Gahunje', status: 'under-construction', bhk: [3, 4], priceMin: 2.5 * Cr, priceMax: 7 * Cr,
    configs: [{ label: '3 BHK' }, { label: '4 BHK' }, { label: 'River villas' }], facts: ['Near the Mumbai–Pune Expressway', 'Apartments and river villas'], featured: true },
  { title: 'Kolte-Patil 24K Verde', dev: 'kolte-patil', city: 'pune', locality: 'Baner', status: 'under-construction', bhk: [3, 4], priceMin: 2 * Cr, priceMax: 3.5 * Cr },
  { title: 'Paranjape Forest Trails', dev: 'paranjape-schemes', city: 'pune', locality: 'Bhugaon', status: 'under-construction', bhk: [3, 4], priceMin: 2.2 * Cr, priceMax: 4.5 * Cr,
    configs: [{ label: '3 BHK' }, { label: '4 BHK' }, { label: 'Villas' }], facts: ['Large township in the Bhugaon–Mulshi belt'] },
  { title: 'VTP Volare', dev: 'vtp-realty', city: 'pune', locality: 'Marunji', status: 'under-construction', bhk: [3], priceMin: 2 * Cr, priceMax: 2.7 * Cr,
    configs: [{ label: '3 BHK' }, { label: '3.5 BHK sky decks' }], facts: ['Hinjewadi IT corridor'] },

  // ── Bangalore ──
  { title: 'Prestige Raintree Park', dev: 'prestige-group', city: 'bangalore', locality: 'Whitefield', status: 'under-construction', bhk: [3, 4, 5], priceMin: 1.35 * Cr, priceMax: 3.5 * Cr, featured: true,
    facts: ['Whitefield–Varthur belt'] },
  { title: 'Sobha Westwood Heights', dev: 'sobha', city: 'bangalore', locality: 'Devanahalli', status: 'under-construction', bhk: [3, 4], priceMin: 1.5 * Cr, priceMax: 3.3 * Cr, facts: ['North Bangalore airport belt'] },
  { title: 'Birla Evara', dev: 'birla-estates', city: 'bangalore', locality: 'Sarjapur Road', status: 'under-construction', bhk: [2, 3, 4], priceMin: 85 * L, priceMax: 2.8 * Cr },
  { title: 'Total Environment Pursuit of a Radical Rhapsody', dev: 'total-environment', city: 'bangalore', locality: 'Whitefield', status: 'under-construction', bhk: [3, 4], priceMin: 3.5 * Cr, priceMax: 8 * Cr },

  // ── Hyderabad ──
  { title: 'Godrej Madison Avenue', dev: 'godrej-properties', city: 'hyderabad', locality: 'Kokapet', status: 'new-launch', bhk: [3, 4], priceMin: 2.82 * Cr, areaMin: 2351, areaMax: 3368,
    possession: 'Dec 2029', facts: ['456 residences', 'Approx. ₹12,000 per sq.ft as published'], featured: true },
  { title: 'Lansum Elena', dev: 'lansum-properties', city: 'hyderabad', locality: 'Kokapet', status: 'under-construction', bhk: [3, 4], priceMin: 3.27 * Cr, priceMax: 4.66 * Cr,
    possession: 'Aug 2028', rera: 'P02400007478', facts: ['Two 55-floor towers', 'Golden Mile Extension Road'] },
  { title: 'Rajapushpa Skyra', dev: 'rajapushpa-properties', city: 'hyderabad', locality: 'Kokapet', status: 'under-construction', bhk: [3, 4],
    facts: ['777 residences in three towers up to 56 floors', '6.5-acre land parcel'] },

  // ── Gurugram ──
  { title: 'DLF The Camellias', dev: 'dlf', city: 'gurugram', locality: 'Golf Course Road', status: 'ready-to-move', bhk: [], priceMin: 26 * Cr, priceMax: 35 * Cr,
    configs: [{ label: 'Ultra-luxury residences' }], facts: ['Golf Course Road address'], featured: true },
  { title: 'M3M Golf Estate', dev: 'm3m', city: 'gurugram', locality: 'Golf Course Extension Road', status: 'ready-to-move', bhk: [], priceMin: 5.58 * Cr, priceMax: 22 * Cr,
    configs: [{ label: 'Luxury residences' }], facts: ['Golf-centric community on GCER'] },
  { title: 'Godrej Astra', dev: 'godrej-properties', city: 'gurugram', locality: 'Sector 54', status: 'new-launch', bhk: [], priceMin: 10.93 * Cr,
    configs: [{ label: 'Premium residences' }], facts: ['252 premium apartments'] },

  // ── Noida ──
  { title: 'Godrej Woods', dev: 'godrej-properties', city: 'noida', locality: 'Sector 43', status: 'ready-to-move', bhk: [3, 4, 5], featured: true },
  { title: 'M3M The Cullinan', dev: 'm3m', city: 'noida', locality: 'Sector 94', status: 'under-construction', bhk: [3, 4, 5] },
  { title: 'ATS Knightsbridge', dev: 'ats-group', city: 'noida', locality: 'Sector 124', status: 'under-construction', bhk: [4, 6] },
  { title: 'ATS Kingston Heath', dev: 'ats-group', city: 'noida', locality: 'Sector 150', status: 'under-construction', bhk: [3, 4] },

  // ── Kolkata ──
  { title: 'PS Jade Grove', dev: 'ps-group', city: 'kolkata', locality: 'New Alipore', status: 'under-construction', bhk: [4, 5, 6], priceMin: 3.54 * Cr, priceMax: 8.82 * Cr,
    possession: 'Feb 2028 (Phase 1)', facts: ['Phase 1 possession Feb 2028, Phase 2 Nov 2029'], featured: true },
  { title: 'Godrej Blue', dev: 'godrej-properties', city: 'kolkata', locality: 'South Kolkata', status: 'under-construction', bhk: [3, 4], priceMin: 2.69 * Cr,
    possession: '2034', rera: 'WBRERA/P/KOL/2024/002211' },

  // ── Ahmedabad ──
  { title: 'Adani Archway', dev: 'adani-realty', city: 'ahmedabad', locality: 'Jagatpur', status: 'ready-to-move', bhk: [3, 4], priceMin: 1.22 * Cr, priceMax: 1.68 * Cr, areaMin: 1061, areaMax: 1383,
    configs: [{ label: '3 BHK', area: '1,061 sq.ft', price: '₹1.22 Cr' }, { label: '4 BHK', area: '1,383 sq.ft', price: '₹1.68 Cr' }], possession: 'Mar 2026 (RERA)', rera: 'RAA10154/050522' },

  // ── Surat ──
  { title: 'Pramukh Agastya', dev: 'pramukh-group', city: 'surat', locality: 'Vesu', status: 'new-launch', bhk: [4], possession: 'Dec 2030', featured: true },
  { title: 'Shaligram Felicity', dev: 'shaligram-group', city: 'surat', locality: 'Pal', status: 'new-launch', bhk: [3, 4], possession: 'Mar 2028' },
];

const bhkText = (b: number[]) => (b.length ? `${b.join(', ')} BHK` : 'luxury');

export function buildReal(): Property[] {
  return list.map((r, i): Property => {
    const city = getCity(r.city)!;
    const dev = getDeveloper(r.dev)!;
    const priceMin = r.priceMin ?? 0;
    const priceMax = r.priceMax ?? 0;
    const configs: { label: string; area?: string; price?: string }[] = r.configs ?? (r.bhk.length ? r.bhk.map((b) => ({ label: `${b} BHK` })) : [{ label: 'Residences' }]);
    const pool = i % 3 === 0 ? img.apartment : i % 3 === 1 ? img.villa : img.apartment;
    return make({
      title: r.title,
      tagline: `${bhkText(r.bhk) === 'luxury' ? 'Luxury residences' : `${bhkText(r.bhk)} residences`} by ${dev.name} in ${r.locality}`,
      type: r.type ?? 'residential',
      listingFor: 'buy',
      status: r.status,
      city: r.city,
      locality: r.locality,
      developer: r.dev,
      priceMin,
      priceMax: priceMin && !priceMax ? 0 : priceMax,
      areaMin: r.areaMin ?? 0,
      areaMax: r.areaMax ?? r.areaMin ?? 0,
      areaUnit: 'sq.ft',
      bhk: r.bhk,
      configurations: configs.map((c) => ({ label: c.label, area: c.area ?? 'On request', price: c.price ?? 'On request' })),
      possession: r.possession ?? 'On request',
      landParcel: 'On request',
      totalUnits: 'On request',
      rera: r.rera ?? `Verify on ${city.state} RERA`,
      images: pick(pool, i * 2),
      amenities: [],
      highlights: [`Developer: ${dev.name}`, `Location: ${r.locality}, ${city.name}`, ...(r.facts ?? [])],
      description: [
        `${r.title} is a ${bhkText(r.bhk)} residential project by ${dev.name} in ${r.locality}, ${city.name}.${priceMin ? ` Published prices start from ${formatINR(priceMin)}${priceMax ? ` and go up to ${formatINR(priceMax)}` : ''}.` : ' Prices are available on request.'}`,
        'Details on this page are compiled from information published by the developer and leading property portals, and may have changed since. Images are representative. Please confirm the latest price, availability, floor plans and RERA registration with the developer before making any decision.',
      ],
      nearby: [],
      featured: r.featured ?? false,
      postedOn: '2026-10-27',
      source: 'published',
    });
  });
}
