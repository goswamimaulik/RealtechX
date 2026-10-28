export type PropertyType = 'residential' | 'commercial' | 'plot' | 'land' | 'villa';
export type ListingFor = 'buy' | 'rent';
export type ProjectStatus = 'new-launch' | 'under-construction' | 'ready-to-move';

export interface Configuration {
  label: string; // e.g. "3 BHK", "Office Suite", "Plot"
  area: string; // e.g. "1,650 sq.ft" or "On request"
  price: string; // display price or "On request"
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
  /** INR (monthly for rent). 0 = price on request */
  priceMin: number;
  priceMax: number;
  /** 0 = area on request */
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
  /** 'published' = real project, details as published by the developer/listing portals; 'sample' = demo listing */
  source: 'published' | 'sample';
  /** Per-listing contact (falls back to the site number). Phase 2: editable in admin. */
  contactPhone?: string; // E.164 without spaces, e.g. +919773069318
  whatsapp?: string; // digits only, e.g. 919773069318
}

/** Lightweight shape sent to the browser for cards & listings. */
export type CardProperty = Pick<
  Property,
  | 'id' | 'slug' | 'title' | 'tagline' | 'type' | 'listingFor' | 'status' | 'city' | 'locality' | 'localitySlug' | 'developer'
  | 'priceMin' | 'priceMax' | 'areaMin' | 'areaMax' | 'areaUnit' | 'bhk' | 'possession' | 'featured' | 'postedOn' | 'source'
  | 'contactPhone' | 'whatsapp'
> & { image: string; configLabels: string[] };

export interface Developer {
  slug: string;
  name: string;
  city: string;
  established: number;
  tagline: string;
  about: string;
  specialties: string[];
  cover: string;
  /** true for real companies — profile text kept neutral & factual */
  real?: boolean;
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
  /** optional city slug for the "projects in …" block */
  city?: string;
}
