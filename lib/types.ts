export type PropertyType = 'residential' | 'commercial' | 'plot' | 'land' | 'villa';
export type ListingFor = 'buy' | 'rent';
export type ProjectStatus = 'new-launch' | 'under-construction' | 'ready-to-move';

export interface Configuration {
  label: string; // e.g. "3 BHK", "Office Suite", "Plot"
  area: string; // e.g. "1,650 sq.ft"
  price: string; // display price
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  type: PropertyType;
  listingFor: ListingFor;
  status: ProjectStatus;
  city: string; // city slug
  locality: string;
  localitySlug: string;
  developer: string; // developer slug
  priceMin: number; // INR (monthly for rent)
  priceMax: number;
  areaMin: number;
  areaMax: number;
  areaUnit: 'sq.ft' | 'sq.yd' | 'acre';
  bhk: number[];
  configurations: Configuration[];
  possession: string;
  landParcel: string;
  totalUnits: string;
  rera: string;
  images: string[];
  amenities: string[];
  highlights: string[];
  description: string[];
  nearby: { name: string; distance: string }[];
  mapQuery: string;
  featured: boolean;
  postedOn: string; // ISO date
}

export interface Developer {
  slug: string;
  name: string;
  city: string;
  established: number;
  tagline: string;
  about: string;
  specialties: string[];
  cover: string;
}

export interface City {
  slug: string;
  name: string;
  state: string;
  image: string;
  blurb: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  cover: string;
  sections: { heading: string; body: string[] }[];
}
