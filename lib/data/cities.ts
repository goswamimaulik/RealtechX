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
];

export const getCity = (slug: string) => cities.find((c) => c.slug === slug);
