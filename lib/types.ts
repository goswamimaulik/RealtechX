export type PropertyType = 'residential' | 'commercial' | 'plot' | 'land' | 'villa';
export type ListingFor = 'buy' | 'rent';
export type ProjectStatus = 'new-launch' | 'under-construction' | 'ready-to-move';

export interface Configuration {
  label: string; // e.g. "3 BHK", "Office Suite", "Plot"
  area: string; // e.g. "1,650 sq.ft" or "On request"
  price: string; // display price or "On request"
  image?: string; // floor plan image (shown blurred until the visitor enquires)
}

export type PublishState = 'published' | 'draft' | 'pending';

export interface SeoFields {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  keywords?: string;
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

  /* ── admin-managed fields (all optional so older data keeps working) ── */
  kind?: 'project' | 'property'; // project = new development by a builder; property = resale / rental unit
  publish?: PublishState;
  purpose?: 'buy' | 'rent' | 'lease';
  subType?: string; // Apartment, Villa, Office, Shop …
  furnishing?: string;
  address?: string;
  lat?: number;
  lng?: number;
  videoUrl?: string;
  brochureUrl?: string;
  reraQr?: string;
  seo?: SeoFields;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  createdBy?: string;
}

/** Lightweight shape sent to the browser for cards & listings. */
export type CardProperty = Pick<
  Property,
  | 'id' | 'slug' | 'title' | 'tagline' | 'type' | 'listingFor' | 'status' | 'city' | 'locality' | 'localitySlug' | 'developer'
  | 'priceMin' | 'priceMax' | 'areaMin' | 'areaMax' | 'areaUnit' | 'bhk' | 'possession' | 'featured' | 'postedOn' | 'source'
  | 'contactPhone' | 'whatsapp'
> & { image: string; configLabels: string[]; cityName: string; developerName: string };

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
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  publish?: PublishState;
  seo?: SeoFields;
}

export interface City {
  slug: string;
  name: string;
  state: string; // state display name
  stateSlug?: string;
  image: string;
  blurb: string;
  popular?: boolean;
  order?: number;
  seo?: SeoFields;
}

export interface State {
  slug: string;
  name: string;
  reraName?: string;
  reraUrl?: string;
}

export interface Locality {
  slug: string;
  name: string;
  city: string; // city slug
  image?: string;
  popular?: boolean;
  about?: string;
  seo?: SeoFields;
}

export interface Term {
  _id?: string;
  group: 'purpose' | 'category' | 'subtype' | 'amenity' | 'furnishing' | 'status';
  slug: string;
  label: string;
  parent?: string; // e.g. subtype → category slug
  order?: number;
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
  publish?: PublishState;
  seo?: SeoFields;
  author?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  description: string;
  url: string;
  logoUrl?: string;
  faviconUrl?: string;
  currency: string;
  phone: string; // display
  phoneRaw: string; // +91...
  whatsapp: string; // digits
  email: string;
  address: string;
  hours: string;
  enquiryCta: string;
  previewNotice: string;
  previewNoticeShort: string;
  showPreviewBar: boolean;
  social: { instagram: string; facebook: string; linkedin: string; youtube: string; twitter?: string };
  notify: { enabled: boolean; emails: string };
  analytics: { gaId: string; gscVerification: string };
  maps: { apiKey: string; defaultZoom: number };
  uploads: { maxMb: number; types: string };
  cookie: { enabled: boolean; text: string };
  seo: { titleTemplate: string; defaultTitle: string; defaultDescription: string; ogImage: string; keywords: string; indexing: boolean };
  security: { sessionMinutes: number; maxLoginAttempts: number };
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';

export interface Lead {
  _id: string;
  leadId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  property?: string;
  propertySlug?: string;
  intent?: string;
  source: string;
  page?: string;
  status: LeadStatus;
  assignedTo?: string; // user id
  followUp?: string; // ISO date
  notes: { at: string; by: string; text: string }[];
  spam?: boolean;
  ip?: string;
  createdAt: string;
  updatedAt?: string;
}

export type Role = 'super_admin' | 'property_manager' | 'content_editor' | 'lead_manager';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  passwordHash?: string;
  phone?: string;
  sessionVersion?: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MediaItem {
  _id: string;
  url: string;
  publicId?: string;
  resourceType: 'image' | 'video' | 'raw';
  folder: string; // properties, floor-plans, banners, brochures, developers, blog, general
  name: string;
  alt?: string;
  bytes?: number;
  width?: number;
  height?: number;
  format?: string;
  createdAt: string;
  createdBy?: string;
}
