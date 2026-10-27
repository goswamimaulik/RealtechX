import type { Property } from './types';

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

export function priceRange(p: Property): string {
  const suffix = p.listingFor === 'rent' ? ' /mo' : '';
  if (p.priceMin === p.priceMax) return formatINR(p.priceMin) + suffix;
  return `${formatINR(p.priceMin)} – ${formatINR(p.priceMax)}${suffix}`;
}

export function areaRange(p: Property): string {
  const f = (n: number) => n.toLocaleString('en-IN');
  if (p.areaMin === p.areaMax) return `${f(p.areaMin)} ${p.areaUnit}`;
  return `${f(p.areaMin)} – ${f(p.areaMax)} ${p.areaUnit}`;
}

export function configLabel(p: Property): string {
  if (p.bhk.length) return p.bhk.join(', ') + ' BHK';
  const labels = Array.from(new Set(p.configurations.map((c) => c.label)));
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

export function startPrice(p: Property): string {
  return formatINR(p.priceMin) + (p.listingFor === 'rent' ? ' /mo' : '');
}
