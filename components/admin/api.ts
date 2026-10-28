'use client';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** JSON fetch helper for /api/admin/* — throws ApiError with the server's message. */
export async function api<T = Record<string, unknown>>(path: string, opts: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(path.startsWith('/') ? path : `/api/admin/${path}`, {
    method: opts.method ?? (opts.body ? 'POST' : 'GET'),
    headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    cache: 'no-store',
    credentials: 'same-origin',
  });
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  if (res.status === 401 && !path.includes('auth/')) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/admin/login?expired=1&next=${next}`;
    throw new ApiError(401, 'Session expired');
  }
  if (!res.ok || data.ok === false) throw new ApiError(res.status, String(data.error || `Request failed (${res.status})`));
  return data as T;
}

export const qs = (o: Record<string, string | number | undefined | null | boolean>) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== false) p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const inr = (n: number) => {
  if (!n) return 'On request';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n % 1e7 ? 2 : 0).replace(/\.?0+$/, '')} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(n % 1e5 ? 2 : 0).replace(/\.?0+$/, '')} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export const when = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const dateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '—';

export const download = (href: string) => {
  const a = document.createElement('a');
  a.href = href;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
};
