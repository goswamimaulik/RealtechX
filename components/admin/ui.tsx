'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2, Plus, Search, Trash2, X, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from './api';

/* ───────────────────────── Toasts & confirm dialog ───────────────────────── */

type Toast = { id: number; tone: 'success' | 'error' | 'info'; text: string };
type ConfirmOpts = { title: string; text?: string; confirm?: string; danger?: boolean };

const Ctx = createContext<{
  toast: (text: string, tone?: Toast['tone']) => void;
  confirm: (o: ConfirmOpts) => Promise<boolean>;
}>({ toast: () => {}, confirm: async () => false });

export function AdminProviders({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dlg, setDlg] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);

  const toast = useCallback((text: string, tone: Toast['tone'] = 'success') => {
    const id = (seq.current = (seq.current ?? 0) + 1);
    setToasts((t) => [...t.slice(-3), { id, tone, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 6000 : 3200);
  }, []);
  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setDlg({ ...o, resolve })), []);
  const close = (v: boolean) => {
    dlg?.resolve(v);
    setDlg(null);
  };

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[200] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:items-end">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex w-full max-w-sm animate-fadeUp items-start gap-3 rounded-xl border border-white/10 bg-ink px-4 py-3 text-[13.5px] text-ivory shadow-luxe">
            {t.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : t.tone === 'error' ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" /> : <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" />}
            <span className="min-w-0 flex-1 leading-snug">{t.text}</span>
          </div>
        ))}
      </div>
      {dlg && (
        <Modal onClose={() => close(false)} size="sm">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${dlg.danger ? 'bg-rose-50 text-rose-600' : 'bg-gold-50 text-gold-dark'}`}>
                {dlg.danger ? <Trash2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[22px] font-semibold leading-tight">{dlg.title}</h3>
                {dlg.text && <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink/65">{dlg.text}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="a-btn a-btn-ghost" onClick={() => close(false)}>Cancel</button>
              <button autoFocus className={`a-btn ${dlg.danger ? 'bg-rose-600 text-white hover:bg-rose-700' : 'a-btn-ink'}`} onClick={() => close(true)}>
                {dlg.confirm ?? 'Confirm'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Ctx.Provider>
  );
}

export const useAdmin = () => useContext(Ctx);

/* ───────────────────────── Overlays ───────────────────────── */

function useEsc(onClose: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
}

function Portal({ children }: { children: React.ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.body), []);
  return el ? createPortal(children, el) : null;
}

export function Modal({ children, onClose, size = 'md', title }: { children: React.ReactNode; onClose: () => void; size?: 'sm' | 'md' | 'lg' | 'xl'; title?: string }) {
  useEsc(onClose);
  const w = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl' }[size];
  return (
    <Portal>
      <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
        <div className="absolute inset-0 animate-fadeIn bg-ink/55 backdrop-blur-[2px]" onClick={onClose} />
        <div className={`relative flex max-h-[92dvh] w-full ${w} animate-sheetUp flex-col overflow-hidden rounded-t-3xl bg-white shadow-luxe sm:animate-zoomIn sm:rounded-3xl`}>
          {title && (
            <div className="flex items-center justify-between gap-4 border-b border-ink/[0.07] px-5 py-4 sm:px-6">
              <h3 className="font-display text-[22px] font-semibold">{title}</h3>
              <IconButton label="Close" onClick={onClose}><X className="h-4 w-4" /></IconButton>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </Portal>
  );
}

/** Right-side panel (full screen on phones). */
export function Drawer({ children, onClose, title, subtitle, footer, wide = false }: { children: React.ReactNode; onClose: () => void; title: React.ReactNode; subtitle?: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  useEsc(onClose);
  return (
    <Portal>
      <div className="fixed inset-0 z-[140]" role="dialog" aria-modal="true">
        <div className="absolute inset-0 animate-fadeIn bg-ink/45 backdrop-blur-[2px]" onClick={onClose} />
        <aside className={`absolute inset-y-0 right-0 flex w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'} animate-slideInRight flex-col bg-ivory shadow-luxe`}>
          <header className="flex items-start justify-between gap-4 border-b border-ink/[0.07] bg-white px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <h3 className="truncate font-display text-[23px] font-semibold leading-tight">{title}</h3>
              {subtitle && <div className="mt-0.5 text-[12.5px] text-ink/55">{subtitle}</div>}
            </div>
            <IconButton label="Close" onClick={onClose}><X className="h-4 w-4" /></IconButton>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-ink/[0.07] bg-white px-5 py-3.5 sm:px-6">{footer}</footer>}
        </aside>
      </div>
    </Portal>
  );
}

/* ───────────────────────── Building blocks ───────────────────────── */

export function PageHeader({ title, eyebrow, subtitle, actions, back }: { title: React.ReactNode; eyebrow?: string; subtitle?: React.ReactNode; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {back && (
          <a href={back.href} className="mb-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink/55 hover:text-gold-dark">
            <ChevronLeft className="h-3.5 w-3.5" /> {back.label}
          </a>
        )}
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-dark">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-[30px] font-semibold leading-[1.05] md:text-[38px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink/60">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '', title, action, pad = true }: { children: React.ReactNode; className?: string; title?: React.ReactNode; action?: React.ReactNode; pad?: boolean }) {
  return (
    <section className={`a-card ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-ink/[0.06] px-5 py-3.5">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink/70">{title}</h2>
          {action}
        </div>
      )}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

export function Field({ label, hint, children, className = '', required }: { label?: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode; className?: string; required?: boolean }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      {label && (
        <span className="a-label">
          {label}
          {required && <span className="ml-0.5 text-gold-dark">*</span>}
        </span>
      )}
      {children}
      {hint && <span className="mt-1.5 block text-[11.5px] leading-snug text-ink/45">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-start gap-3 rounded-xl border border-ink/[0.08] bg-white px-3.5 py-3 text-left transition hover:border-gold/50">
      <span className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition ${checked ? 'bg-gold' : 'bg-ink/15'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] leading-snug text-ink/50">{hint}</span>}
      </span>
    </button>
  );
}

const tones = {
  gray: 'bg-ink/[0.06] text-ink/70',
  gold: 'bg-gold-50 text-gold-dark ring-1 ring-gold/30',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  blue: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  red: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  violet: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  ink: 'bg-ink text-gold-light',
};
export type Tone = keyof typeof tones;

export function Badge({ children, tone = 'gray', className = '' }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${tones[tone]} ${className}`}>{children}</span>;
}

export const publishTone = (s?: string): Tone => (s === 'published' ? 'green' : s === 'pending' ? 'amber' : 'gray');
export const leadTone = (s?: string): Tone => ({ new: 'blue', contacted: 'amber', qualified: 'violet', closed: 'green', lost: 'red' } as Record<string, Tone>)[s ?? ''] ?? 'gray';

export function Tabs<T extends string>({ tabs, value, onChange, className = '' }: { tabs: { value: T; label: React.ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={`no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0 ${className}`}>
      <div className="inline-flex gap-1 rounded-2xl border border-ink/[0.07] bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-semibold transition ${value === t.value ? 'bg-ink text-ivory shadow-sm' : 'text-ink/60 hover:bg-ivory hover:text-ink'}`}
          >
            {t.label}
            {t.count !== undefined && <span className={`rounded-full px-1.5 text-[10.5px] ${value === t.value ? 'bg-gold text-ink' : 'bg-ink/[0.07] text-ink/60'}`}>{t.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = 'Search…', className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  useEffect(() => {
    if (v === value) return;
    const t = window.setTimeout(() => onChange(v), 350);
    return () => window.clearTimeout(t);
  }, [v, value, onChange]);
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className="a-input !pl-10" type="search" />
    </div>
  );
}

export function Pagination({ page, pages, total, onPage, label = 'items' }: { page: number; pages: number; total: number; onPage: (p: number) => void; label?: string }) {
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-1 pt-4 text-[12.5px] text-ink/55">
      <span>
        {total.toLocaleString('en-IN')} {label}
      </span>
      {pages > 1 && (
        <div className="flex items-center gap-1">
          <IconButton label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft className="h-4 w-4" /></IconButton>
          <span className="px-2 font-semibold text-ink">
            {page} / {pages}
          </span>
          <IconButton label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}><ChevronRight className="h-4 w-4" /></IconButton>
        </div>
      )}
    </div>
  );
}

export function IconButton({ children, label, onClick, disabled, className = '', tone = 'default' }: { children: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean; className?: string; tone?: 'default' | 'danger' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition disabled:pointer-events-none disabled:opacity-35 ${tone === 'danger' ? 'border-rose-100 text-rose-600 hover:bg-rose-50' : 'border-ink/[0.08] bg-white text-ink/70 hover:border-gold/50 hover:text-gold-dark'} ${className}`}
    >
      {children}
    </button>
  );
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function Loading({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-ink/[0.045]" style={{ animationDelay: `${i * 60}ms` }} />
      ))}
    </div>
  );
}

export function Empty({ icon: Icon = Info, title, text, action }: { icon?: React.ElementType; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-50 text-gold-dark ring-1 ring-gold/25"><Icon className="h-6 w-6" /></span>
      <p className="mt-4 font-display text-[22px] font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-[13.5px] text-ink/55">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorBox({ error, retry }: { error: string; retry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-5 text-[13.5px] text-rose-800 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</span>
      {retry && <button className="a-btn a-btn-ghost a-btn-sm" onClick={retry}>Try again</button>}
    </div>
  );
}

/** Save button with built-in busy state. */
export function SaveButton({ busy, children = 'Save changes', className = '', onClick, type = 'button' }: { busy?: boolean; children?: React.ReactNode; className?: string; onClick?: () => void; type?: 'button' | 'submit' }) {
  return (
    <button type={type} onClick={onClick} disabled={busy} className={`a-btn a-btn-gold shine ${className}`}>
      {busy && <Spinner />} {children}
    </button>
  );
}

export function AddButton({ children, onClick, href }: { children: React.ReactNode; onClick?: () => void; href?: string }) {
  const cls = 'a-btn a-btn-gold shine';
  return href ? (
    <a href={href} className={cls}><Plus className="h-4 w-4" />{children}</a>
  ) : (
    <button type="button" onClick={onClick} className={cls}><Plus className="h-4 w-4" />{children}</button>
  );
}

/* ───────────────────────── Data hooks ───────────────────────── */

export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

/** Loads /api/admin/<path> whenever `query` changes. */
export function useApi<T>(path: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!path);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!path) return;
    const ctl = new AbortController();
    setLoading(true);
    setError('');
    api<T>(path, { signal: ctl.signal })
      .then((d) => setData(d))
      .catch((e) => {
        if (e?.name !== 'AbortError') setError(e?.message || 'Could not load data');
      })
      .finally(() => !ctl.signal.aborted && setLoading(false));
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload, setData };
}

/* ───────────────────────── Form helpers ───────────────────────── */

/** Chips input with suggestions (amenities, specialties, keywords…). */
export function TagInput({ value, onChange, suggestions = [], placeholder = 'Type and press Enter' }: { value: string[]; onChange: (v: string[]) => void; suggestions?: string[]; placeholder?: string }) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const add = (t: string) => {
    const v = t.trim();
    if (v && !value.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...value, v]);
    setDraft('');
  };
  const matches = suggestions.filter((s) => !value.includes(s) && s.toLowerCase().includes(draft.toLowerCase())).slice(0, 8);
  return (
    <div className="relative">
      <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border border-ink/10 bg-white p-1.5 focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/15">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-ivory-200 py-1 pl-2.5 pr-1 text-[12.5px] font-medium">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))} className="grid h-5 w-5 place-items-center rounded-md text-ink/50 hover:bg-white hover:text-rose-600">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          placeholder={value.length ? '' : placeholder}
          className="min-w-[120px] flex-1 bg-transparent px-2 py-1 text-[16px] outline-none md:text-[13.5px]"
        />
      </div>
      {open && matches.length > 0 && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-ink/10 bg-white p-1 shadow-luxe">
          {matches.map((m) => (
            <button key={m} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(m)} className="block w-full rounded-lg px-3 py-2 text-left text-[13px] hover:bg-ivory">
              {m}
            </button>
          ))}
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.filter((s) => !value.includes(s)).slice(0, 14).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-dashed border-ink/15 px-2.5 py-1 text-[11.5px] text-ink/60 hover:border-gold hover:text-gold-dark">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Generic repeater for arrays of objects (configurations, nearby places, FAQs…). */
export function Repeater<T extends object>({ items, onChange, blank, render, addLabel = 'Add row', max = 50 }: { items: T[]; onChange: (v: T[]) => void; blank: T; render: (item: T, set: (patch: Partial<T>) => void, i: number) => React.ReactNode; addLabel?: string; max?: number }) {
  const update = (i: number, patch: Partial<T>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={i} className="group relative rounded-2xl border border-ink/[0.08] bg-ivory/50 p-3 pr-12 sm:p-4 sm:pr-14">
          {render(it, (p) => update(i, p), i)}
          <div className="absolute right-2 top-2 flex flex-col gap-1 sm:right-3 sm:top-3">
            <button type="button" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid h-7 w-7 place-items-center rounded-lg text-ink/40 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-lg text-ink/40 hover:bg-white hover:text-ink disabled:opacity-20"><ArrowUp className="h-3.5 w-3.5" /></button>
            <button type="button" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-lg text-ink/40 hover:bg-white hover:text-ink disabled:opacity-20"><ArrowDown className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, { ...blank }])} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/15 py-3 text-[13px] font-semibold text-ink/55 transition hover:border-gold hover:bg-gold-50/40 hover:text-gold-dark">
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}

/** Character counter for SEO fields. */
export function Counter({ value, ideal }: { value: string; ideal: [number, number] }) {
  const n = value.length;
  const tone = n === 0 ? 'text-ink/35' : n < ideal[0] || n > ideal[1] ? 'text-amber-600' : 'text-emerald-600';
  return <span className={`text-[11px] font-semibold ${tone}`}>{n} / {ideal[1]}</span>;
}

/** Warns before leaving a page with unsaved changes. */
export function useUnsaved(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);
}
