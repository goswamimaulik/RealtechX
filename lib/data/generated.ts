import type { Configuration, Property, PropertyType, ProjectStatus } from '../types';
import { img, pick } from './images';
import { make } from './build';
import { cities, getCity } from './cities';
import { getDeveloper } from './developers';
import { formatINR, slugify } from '../format';

/**
 * Sample (demo) listings that top up every city × property type to TARGET listings.
 * They only ever use the portal's fictional sample developers — never a real company.
 */
const TARGET = 5;
const TYPES: PropertyType[] = ['residential', 'commercial', 'plot', 'land', 'villa'];

type CityCfg = { devs: string[]; res: string[]; com: string[]; land: string[]; rate: number; plotRate: number; landAcre: number; marks: string[] };

const cfg: Record<string, CityCfg> = {
  mumbai: {
    devs: ['skyline-crest-developers', 'coastal-estates'],
    res: ['Worli', 'Bandra West', 'Lower Parel', 'Powai', 'Andheri West', 'Juhu', 'Prabhadevi', 'Goregaon East', 'Malabar Hill', 'Borivali West'],
    com: ['Bandra Kurla Complex', 'Lower Parel', 'Andheri East', 'Powai', 'Worli'],
    land: ['Alibaug', 'Karjat', 'Khopoli', 'Palghar', 'Shahapur'],
    rate: 38000, plotRate: 4500, landAcre: 1.2e7, marks: ['Mumbai Airport', 'Western Express Highway', 'Metro station', 'Bandra Kurla Complex', 'Phoenix Palladium'],
  },
  'navi-mumbai': {
    devs: ['harbour-line-realty'],
    res: ['Vashi', 'Kharghar', 'Nerul', 'Seawoods', 'Ulwe', 'Panvel', 'Belapur', 'Ghansoli'],
    com: ['Belapur', 'Vashi', 'Airoli', 'Seawoods', 'Kharghar'],
    land: ['Panvel', 'Uran', 'Pen', 'Khalapur', 'Ulwe'],
    rate: 16000, plotRate: 3500, landAcre: 1.5e7, marks: ['Navi Mumbai International Airport', 'Sion–Panvel Highway', 'Metro station', 'Palm Beach Road', 'Seawoods Grand Central'],
  },
  pune: {
    devs: ['aurum-realty'],
    res: ['Baner', 'Kharadi', 'Koregaon Park', 'Kalyani Nagar', 'Wakad', 'Hinjewadi', 'Bavdhan', 'Viman Nagar', 'Balewadi', 'Aundh'],
    com: ['Kharadi', 'Baner', 'Hinjewadi', 'Viman Nagar', 'Shivajinagar'],
    land: ['Maan', 'Mulshi', 'Talegaon', 'Lonavala', 'Purandar'],
    rate: 12000, plotRate: 3000, landAcre: 8e6, marks: ['Pune Airport', 'Mumbai–Bangalore Highway', 'Hinjewadi IT Park', 'Pune Metro station', 'Phoenix Marketcity'],
  },
  bangalore: {
    devs: ['verdant-habitats', 'meridian-land-ventures'],
    res: ['Whitefield', 'Sarjapur Road', 'Hebbal', 'Indiranagar', 'Koramangala', 'Yelahanka', 'HSR Layout', 'Jayanagar', 'Electronic City'],
    com: ['Whitefield', 'Outer Ring Road', 'MG Road', 'Electronic City', 'Hebbal'],
    land: ['Devanahalli', 'Kanakapura Road', 'Hoskote', 'Doddaballapur', 'Nandi Hills'],
    rate: 11000, plotRate: 3500, landAcre: 9e6, marks: ['Kempegowda International Airport', 'Outer Ring Road', 'Namma Metro station', 'ITPL', 'Phoenix Marketcity'],
  },
  hyderabad: {
    devs: ['deccan-heights-group'],
    res: ['Kokapet', 'Gachibowli', 'Jubilee Hills', 'Financial District', 'Kondapur', 'Banjara Hills', 'Tellapur', 'Narsingi'],
    com: ['HITEC City', 'Financial District', 'Gachibowli', 'Madhapur', 'Kokapet'],
    land: ['Shadnagar', 'Shamshabad', 'Kollur', 'Sadasivpet', 'Bhongir'],
    rate: 10000, plotRate: 3000, landAcre: 1e7, marks: ['Rajiv Gandhi International Airport', 'Outer Ring Road', 'HITEC City', 'Metro station', 'Inorbit Mall'],
  },
  gurugram: {
    devs: ['aravalli-crest-realty'],
    res: ['Golf Course Road', 'Golf Course Extension Road', 'Sector 65', 'Dwarka Expressway', 'Sohna Road', 'Sector 54', 'Sector 113', 'Sector 79'],
    com: ['Cyber City', 'Golf Course Extension Road', 'Sohna Road', 'Udyog Vihar', 'Sector 65'],
    land: ['Sohna', 'Manesar', 'Pataudi Road', 'Farrukhnagar', 'Tauru Road'],
    rate: 15000, plotRate: 5000, landAcre: 2e7, marks: ['IGI Airport', 'NH-48', 'Cyber Hub', 'Rapid Metro station', 'Golf Course Road'],
  },
  noida: {
    devs: ['yamuna-skyline-developers'],
    res: ['Sector 150', 'Sector 128', 'Sector 94', 'Sector 44', 'Noida Extension', 'Sector 137', 'Sector 107', 'Sector 104'],
    com: ['Sector 62', 'Sector 18', 'Sector 132', 'Sector 98', 'Sector 16A'],
    land: ['Yamuna Expressway', 'Jewar', 'Dadri', 'Greater Noida', 'Tappal'],
    rate: 11000, plotRate: 3500, landAcre: 1.2e7, marks: ['Noida–Greater Noida Expressway', 'DND Flyway', 'Aqua Line Metro station', 'Noida International Airport (Jewar)', 'DLF Mall of India'],
  },
  kolkata: {
    devs: ['hooghly-heritage-developers'],
    res: ['New Town', 'Rajarhat', 'Ballygunge', 'Alipore', 'EM Bypass', 'Salt Lake', 'Tollygunge', 'New Alipore'],
    com: ['Salt Lake Sector V', 'Park Street', 'EM Bypass', 'New Town', 'Camac Street'],
    land: ['Joka', 'Baruipur', 'Barasat', 'Diamond Harbour Road', 'Bolpur'],
    rate: 9000, plotRate: 1500, landAcre: 6e6, marks: ['Kolkata Airport', 'EM Bypass', 'Metro station', 'Salt Lake Sector V', 'Quest Mall'],
  },
  ahmedabad: {
    devs: ['sabarmati-spaces'],
    res: ['Sindhu Bhavan Road', 'Bodakdev', 'Shela', 'Thaltej', 'Prahlad Nagar', 'Science City', 'South Bopal', 'Ambli'],
    com: ['SG Highway', 'Prahlad Nagar', 'Sindhu Bhavan Road', 'GIFT City', 'Ashram Road'],
    land: ['Sanand', 'Bavla', 'Dholera', 'Mehsana Highway', 'Kalol'],
    rate: 7500, plotRate: 2000, landAcre: 5e6, marks: ['Ahmedabad Airport', 'SG Highway', 'SP Ring Road', 'Metro station', 'GIFT City'],
  },
  surat: {
    devs: ['tapi-riverfront-builders'],
    res: ['Vesu', 'Pal', 'Dumas Road', 'Althan', 'Adajan', 'Citylight', 'Piplod', 'Athwa'],
    com: ['Ring Road', 'Vesu', 'Adajan', 'Athwa', 'Udhna'],
    land: ['Olpad', 'Kamrej', 'Hazira', 'Bardoli', 'Sachin'],
    rate: 6500, plotRate: 1800, landAcre: 4.5e6, marks: ['Surat Airport', 'Surat Railway Station', 'VR Mall', 'Dumas Road', 'Ring Road'],
  },
};

const words = ['Aria', 'Vista', 'Elan', 'Serene', 'Regalia', 'Opus', 'Solitaire', 'Avenue', 'Meridian', 'Aurelia', 'Celeste', 'Ivory', 'Zenith', 'Luxe', 'Grandeur',
  'Altura', 'Belvedere', 'Cascade', 'Eden', 'Horizon', 'Imperia', 'Lumina', 'Marquis', 'Noble', 'Orchid', 'Palisade', 'Royale', 'Sapphire', 'Summit', 'Verve'];
const suffix: Record<PropertyType, string[]> = {
  residential: ['Residences', 'Heights', 'Towers', 'One', 'Signature'],
  commercial: ['Business Park', 'Corporate Tower', 'Trade Centre', 'Square', 'Business Bay'],
  plot: ['Greens', 'Meadows', 'County', 'Enclave', 'Estates'],
  land: ['Farmlands', 'Acres', 'Valley Estates', 'Retreat Land', 'Land Parcels'],
  villa: ['Villas', 'Villa Estate', 'Mansions', 'Private Residences', 'Villa Enclave'],
};

// deterministic pseudo-random
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const round = (n: number, to: number) => Math.round(n / to) * to;
const fmtArea = (n: number) => `${n.toLocaleString('en-IN')} sq.ft`;
const months = ['Mar', 'Jun', 'Sep', 'Dec'];

export function buildGenerated(existing: Property[]): Property[] {
  const out: Property[] = [];
  const usedSlugs = new Set(existing.map((p) => p.slug));
  let w = 0;
  let k = 0;
  for (const city of cities) {
    const c = cfg[city.slug];
    if (!c) continue;
    for (const type of TYPES) {
      const have = existing.filter((p) => p.city === city.slug && p.type === type).length;
      for (let i = have; i < TARGET; i++) {
        k += 1;
        const r = rng(`${city.slug}-${type}-${i}`);
        const devSlug = c.devs[i % c.devs.length];
        const dev = getDeveloper(devSlug)!;
        const locs = type === 'commercial' ? c.com : type === 'plot' || type === 'land' ? c.land : c.res;
        const locality = locs[(i + (type === 'villa' ? 3 : 0)) % locs.length];
        let title = '';
        do {
          title = `${dev.name.split(' ')[0]} ${words[w % words.length]} ${suffix[type][(w + i) % 5]}`;
          w += 1;
        } while (usedSlugs.has(slugify(`${title} ${locality} ${city.slug}`)));
        usedSlugs.add(slugify(`${title} ${locality} ${city.slug}`));

        const status: ProjectStatus = (['new-launch', 'under-construction', 'ready-to-move'] as const)[(i + k) % 3];
        const possession = status === 'ready-to-move' ? (type === 'plot' || type === 'land' ? 'Ready for construction' : 'Ready') : `${months[(k + i) % 4]} ${status === 'new-launch' ? 2030 + (k % 2) : 2027 + (k % 3)}`;
        const locMul = 0.85 + ((i * 7 + k) % 10) / 18;
        const isRent = (type === 'residential' && i === 3) || (type === 'commercial' && (i === 1 || i === 4)) || (type === 'villa' && i === 4);

        let bhk: number[] = [];
        let configs: Configuration[] = [];
        let areaMin = 0, areaMax = 0, priceMin = 0, priceMax = 0;
        let areaUnit: Property['areaUnit'] = 'sq.ft';
        const rate = c.rate * locMul;

        if (type === 'residential' || type === 'villa') {
          bhk = type === 'villa' ? [[4], [4, 5], [5], [4, 5], [5, 6]][i] : [[2, 3], [3, 4], [3, 4, 5], [2, 3], [4, 5]][i];
          configs = bhk.map((b) => {
            const a = round(type === 'villa' ? 1200 + b * 820 + r() * 600 : 380 + b * 420 + r() * 180, 10);
            const pr = a * rate * (type === 'villa' ? 1.15 : 1);
            return { label: `${b} BHK${type === 'villa' ? ' Villa' : ''}`, area: fmtArea(a), price: isRent ? `${formatINR(round(pr * 0.0025, 5000))} /month` : `${formatINR(round(pr, 100000))} onwards`, _a: a, _p: pr } as Configuration & { _a: number; _p: number };
          });
        } else if (type === 'commercial') {
          const base = [[650, 1400, 3200], [900, 2500, 6000], [1200, 4000, 9000], [500, 1100, 2400], [800, 3000, 7500]][i];
          configs = base.map((a, j) => {
            const pr = a * rate * 1.25;
            return { label: ['Office Suite', 'Office Floor (Half)', 'Office Floor (Full)'][j], area: fmtArea(a), price: isRent ? `${formatINR(round(pr * 0.006, 5000))} /month` : `${formatINR(round(pr, 100000))} onwards`, _a: a, _p: pr } as Configuration & { _a: number; _p: number };
          });
          if (i % 2 === 0) configs[1] = { ...configs[1], label: 'Retail Shop' };
        } else if (type === 'plot') {
          const base = [[1200, 2400, 4000], [1500, 2500, 3500], [1800, 2700, 4500], [1000, 2000, 3000], [2000, 3000, 5000]][i];
          configs = base.map((a, j) => {
            const pr = a * c.plotRate * locMul;
            return { label: j === 2 ? 'Premium Plot' : 'Plot', area: fmtArea(a), price: `${formatINR(round(pr, 100000))} onwards`, _a: a, _p: pr } as Configuration & { _a: number; _p: number };
          });
        } else {
          areaUnit = 'acre';
          const base = [[0.5, 2, 5], [1, 3, 8], [0.25, 1, 3], [1, 4, 10], [2, 5, 12]][i];
          configs = base.map((a) => {
            const pr = a * c.landAcre * locMul;
            return { label: a < 1 ? `${a * 4 === 1 ? 'Quarter' : 'Half'}-acre Parcel` : `${a}-acre Parcel`, area: `${a} acre${a > 1 ? 's' : ''}`, price: `${formatINR(round(pr, 100000))} onwards`, _a: a, _p: pr } as Configuration & { _a: number; _p: number };
          });
        }
        const raw = configs as (Configuration & { _a: number; _p: number })[];
        areaMin = Math.min(...raw.map((x) => x._a));
        areaMax = Math.max(...raw.map((x) => x._a));
        const mult = isRent ? (type === 'commercial' ? 0.006 : 0.0025) : 1;
        priceMin = round(Math.min(...raw.map((x) => x._p)) * mult, isRent ? 5000 : 100000);
        priceMax = round(Math.max(...raw.map((x) => x._p)) * mult * (isRent ? 1 : 1.12), isRent ? 5000 : 100000);
        configs = raw.map(({ label, area, price }) => ({ label, area, price }));

        const pool = type === 'commercial' ? img.commercial : type === 'villa' ? img.villa : type === 'residential' ? img.apartment : [...img.land, ...img.villa.slice(4)];
        const nearby = c.marks.slice(0, 4 + (i % 2)).map((m, j) => ({ name: m, distance: `${Math.max(0.5, Math.round((1 + r() * (j === 0 ? 30 : 12)) * 2) / 2)} km` }));
        const what = { residential: 'residences', commercial: 'commercial spaces', plot: 'residential plots', land: 'land parcels', villa: 'villas' }[type];
        const day = String(1 + ((k * 3) % 27)).padStart(2, '0');

        out.push(make({
          title,
          tagline: `${type === 'residential' || type === 'villa' ? bhk.join(' & ') + ' BHK ' : ''}${what} ${isRent ? 'for rent' : ''} in ${locality}`.replace(/\s+/g, ' ').trim(),
          type,
          listingFor: isRent ? 'rent' : 'buy',
          status: isRent ? 'ready-to-move' : status,
          city: city.slug,
          locality,
          developer: devSlug,
          priceMin,
          priceMax,
          areaMin,
          areaMax,
          areaUnit,
          bhk,
          configurations: configs,
          possession: isRent ? 'Immediate' : possession,
          landParcel: type === 'land' ? `${Math.round(20 + r() * 80)} Acres` : `${(1 + r() * (type === 'plot' ? 30 : 8)).toFixed(1)} Acres`,
          totalUnits: type === 'commercial' ? `${Math.round(8 + r() * 30)} Floors` : type === 'land' ? `${Math.round(10 + r() * 30)} Parcels` : `${Math.round((type === 'villa' ? 20 : 120) + r() * (type === 'villa' ? 80 : 500))} ${type === 'plot' ? 'Plots' : type === 'villa' ? 'Villas' : 'Homes'}`,
          images: pick(pool, k),
          highlights: [
            `Prime ${locality} address`,
            type === 'commercial' ? 'Grade-A specifications' : type === 'land' ? 'Clear title, demarcated' : type === 'plot' ? 'Approved gated layout' : 'Spacious, Vastu-friendly layouts',
            `Close to ${c.marks[2]}`,
            status === 'ready-to-move' || isRent ? 'Ready for immediate possession' : 'Construction-linked payment plan',
          ],
          description: [
            `${title} brings ${what} to ${locality}, ${getCity(city.slug)!.name}, by ${dev.name}. ${type === 'residential' || type === 'villa' ? 'Homes are planned for light, ventilation and privacy, with generous balconies and premium specifications.' : type === 'commercial' ? 'Flexible floor plates suit corporate offices, start-ups and retail brands.' : 'Well-connected and ready for you to build on or hold as a long-term investment.'}`,
            `${locality} offers quick access to ${c.marks[0]} and ${c.marks[1]}, with schools, hospitals and shopping close by. This is a sample listing shown for demonstration on the RealtechX preview portal.`,
          ],
          nearby,
          featured: false,
          postedOn: `2026-${k % 2 ? '10' : '09'}-${day}`,
          source: 'sample',
        }));
      }
    }
  }
  return out;
}
