/* Input normalisers for admin forms — everything coming from the browser passes through these. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpError } from './auth';

export const str = (v: any, max = 500) => (v == null ? '' : String(v).replace(/\u0000/g, '').trim().slice(0, max));
export const text = (v: any, max = 20000) => (v == null ? '' : String(v).replace(/\u0000/g, '').replace(/\r\n/g, '\n').trim().slice(0, max));
export const num = (v: any, min = 0, max = 1e13) => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[,\s₹]/g, ''));
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : 0;
};
export const optNum = (v: any) => (v === '' || v == null || !Number.isFinite(Number(v)) ? undefined : Number(v));
export const bool = (v: any) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on';
export const oneOf = <T extends string>(v: any, allowed: readonly T[], def: T): T => (allowed.includes(v) ? v : def);
export const list = (v: any, max = 200, each = 300): string[] =>
  (Array.isArray(v) ? v : typeof v === 'string' ? v.split(/\n|,/) : [])
    .map((x: any) => str(x, each))
    .filter(Boolean)
    .slice(0, max);
export const lines = (v: any, max = 200, each = 600): string[] =>
  (Array.isArray(v) ? v : typeof v === 'string' ? v.split('\n') : []).map((x: any) => str(x, each)).filter(Boolean).slice(0, max);
export const paragraphs = (v: any): string[] =>
  (Array.isArray(v) ? v.map((x: any) => text(x, 5000)) : text(v).split(/\n{2,}/)).map((p: string) => p.trim()).filter(Boolean).slice(0, 60);

export function url(v: any, max = 1000) {
  const s = str(v, max);
  if (!s) return '';
  if (s.startsWith('/')) return s;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : '';
  } catch {
    return '';
  }
}
export const urls = (v: any, max = 60) => (Array.isArray(v) ? v : list(v, max, 1000)).map((x: any) => url(x)).filter(Boolean).slice(0, max);

export function email(v: any) {
  const s = str(v, 160).toLowerCase();
  if (s && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new HttpError(422, `“${s}” is not a valid email address.`);
  return s;
}

export function emailList(v: any) {
  return str(v, 1000)
    .split(/[,;\s]+/)
    .filter(Boolean)
    .map((e) => email(e))
    .join(', ');
}

/** +91XXXXXXXXXX (E.164) from "98765 43210" / "+91 98765-43210" */
export function phoneE164(v: any) {
  const s = str(v, 30);
  if (!s) return '';
  const digits = s.replace(/\D/g, '');
  if (s.trim().startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

export function seo(v: any) {
  const o = v && typeof v === 'object' ? v : {};
  const out = {
    title: str(o.title, 120),
    description: str(o.description, 320),
    ogImage: url(o.ogImage),
    canonical: str(o.canonical, 300),
    keywords: str(o.keywords, 400),
    noindex: bool(o.noindex),
  };
  return Object.fromEntries(Object.entries(out).filter(([, x]) => x !== '' && x !== false));
}

export function required(v: string, label: string) {
  if (!v) throw new HttpError(422, `${label} is required.`);
  return v;
}
