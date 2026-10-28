import type { City } from '../types';
import { img } from './images';

export const cities: City[] = [
  {
    slug: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    image: img.city.mumbai,
    blurb: 'Sea-facing residences, Grade-A offices in BKC and weekend homes across the MMR coastline.',
  },
  {
    slug: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    image: img.city.pune,
    blurb: 'IT corridors of Baner, Kharadi and Hinjewadi with strong rental demand and family-friendly townships.',
  },
  {
    slug: 'bangalore',
    name: 'Bangalore',
    state: 'Karnataka',
    image: img.city.bangalore,
    blurb: "India's tech capital — Whitefield, Sarjapur and the fast-growing North Bangalore airport belt.",
  },
  {
    slug: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    image: img.city.hyderabad,
    blurb: 'Kokapet sky-rises, HITEC City offices and premium villas in Jubilee Hills.',
  },
  {
    slug: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    image: img.city.ahmedabad,
    blurb: 'SG Highway business district, Sindhu Bhavan Road luxury living and the Sanand industrial growth story.',
  },
  {
    slug: 'surat',
    name: 'Surat',
    state: 'Gujarat',
    image: img.city.surat,
    blurb: 'Vesu and the Tapi riverfront — one of the fastest-growing cities in India for premium homes.',
  },
  {
    slug: 'navi-mumbai',
    name: 'Navi Mumbai',
    state: 'Maharashtra',
    image: img.apartment[8],
    blurb: 'Planned nodes like Vashi, Kharghar and Ulwe — set to transform with the new Navi Mumbai International Airport.',
  },
  {
    slug: 'gurugram',
    name: 'Gurugram',
    state: 'Haryana',
    image: img.commercial[1],
    blurb: 'Golf Course Road trophy homes, Dwarka Expressway launches and the Cyber City business district.',
  },
  {
    slug: 'noida',
    name: 'Noida',
    state: 'Uttar Pradesh',
    image: img.apartment[3],
    blurb: 'Expressway-facing sectors, green low-density towers and the Jewar airport growth corridor.',
  },
  {
    slug: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    image: img.apartment[5],
    blurb: 'Heritage addresses in Alipore and Ballygunge alongside new-age towers in New Town and on EM Bypass.',
  },
];

export const getCity = (slug: string) => cities.find((c) => c.slug === slug);
