/** Small server-side helpers shared by API routes. */

/** YYYY-MM-DD in India time (used for daily stats). */
export function istDate(d = new Date()) {
  return new Date(d.getTime() + 330 * 60_000).toISOString().slice(0, 10);
}

export function clientIp(req: Request) {
  const h = req.headers;
  return (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || '').trim().slice(0, 64) || 'unknown';
}

export const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function slugify(s: string) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}
