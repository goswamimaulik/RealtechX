import type { Property, CardProperty } from './types';

type Priced = Pick<Property, 'priceMin' | 'priceMax' | 'listingFor'>;
type Sized = Pick<Property, 'areaMin' | 'areaMax' | 'areaUnit'>;

export function formatINR(value: number, short = true): string {
  if (!short) return '₹' + value.toLocaleString('en-IN');
  if (value >= 1e7) return '₹' + trim(value / 1e7) + ' Cr';
  if (value >= 1e5) return '₹' + trim(value / 1e5) + ' L';
  if (value >= 1e3) return '₹' + trim(value / 1e3) + 'K';
  return '₹' + value.toLocaleString('en-IN');
}

function trim(n: number) {
  return Number(n.toFixed(2)).toString();
}

export function priceRange(p: Priced): string {
  const suffix = p.listingFor === 'rent' ? ' /mo' : '';
  if (!p.priceMin) return 'Price on request';
  if (!p.priceMax) return `${formatINR(p.priceMin)} onwards${suffix}`;
  if (p.priceMin === p.priceMax) return formatINR(p.priceMin) + suffix;
  return `${formatINR(p.priceMin)} – ${formatINR(p.priceMax)}${suffix}`;
}

export function areaRange(p: Sized): string {
  const f = (n: number) => n.toLocaleString('en-IN');
  if (!p.areaMin) return 'On request';
  if (p.areaMin === p.areaMax) return `${f(p.areaMin)} ${p.areaUnit}`;
  return `${f(p.areaMin)} – ${f(p.areaMax)} ${p.areaUnit}`;
}

export function configLabel(p: Pick<Property, 'bhk'> & ({ configurations: { label: string }[] } | { configLabels: string[] })): string {
  if (p.bhk.length) return p.bhk.join(', ') + ' BHK';
  const all = 'configLabels' in p ? p.configLabels : p.configurations.map((c) => c.label);
  const labels = Array.from(new Set(all));
  return labels.slice(0, 2).join(', ');
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function titleCase(s: string) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function startPrice(p: Priced): string {
  if (!p.priceMin) return 'Price on request';
  return formatINR(p.priceMin) + (p.listingFor === 'rent' ? ' /mo' : '');
}

/** Short area label for cards, e.g. "1.65K – 2.6K ft²" or "0.5 – 5 acre". */
export function areaCompact(p: Sized): string {
  if (!p.areaMin) return 'On request';
  const unit = p.areaUnit === 'sq.ft' ? 'ft²' : p.areaUnit;
  const f = (n: number) => (p.areaUnit === 'sq.ft' && n >= 1000 ? `${Number((n / 1000).toFixed(2))}K` : n.toLocaleString('en-IN'));
  return p.areaMin === p.areaMax ? `${f(p.areaMin)} ${unit}` : `${f(p.areaMin)}–${f(p.areaMax)} ${unit}`;
}

/** Contact numbers for a listing — per-property number if set, otherwise the site number. */
export function contactOf(p: Pick<CardProperty, 'contactPhone' | 'whatsapp'>, fallback: { phoneRaw: string; whatsapp: string }) {
  const tel = p.contactPhone || fallback.phoneRaw;
  const wa = (p.whatsapp || p.contactPhone || fallback.whatsapp).replace(/\D/g, '');
  return { tel, wa };
}
