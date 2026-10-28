'use client';

import { useEffect, useState } from 'react';
import { BadgePercent, CalendarCheck, FileText, PhoneCall, ShieldCheck, X } from 'lucide-react';
import LeadForm from './LeadForm';
import { useSite } from './SiteContext';

export interface LeadModalDetail {
  title?: string;
  subtitle?: string;
  property?: string;
  intent?: string;
  source?: string;
  image?: string;
}

const EVT = 'rtx-open-lead';

export function openLead(detail: LeadModalDetail = {}) {
  window.dispatchEvent(new CustomEvent<LeadModalDetail>(EVT, { detail }));
}

const perks = [
  { Icon: BadgePercent, t: 'Best price & offers' },
  { Icon: FileText, t: 'Price sheet & floor plans' },
  { Icon: CalendarCheck, t: 'Free site visit' },
];

/** Mounted once in the root layout; any component can call openLead(). */
export default function LeadModalHost() {
  const [detail, setDetail] = useState<LeadModalDetail | null>(null);
  const site = useSite();

  useEffect(() => {
    const handler = (e: Event) => setDetail({ ...((e as CustomEvent<LeadModalDetail>).detail || {}) });
    window.addEventListener(EVT, handler);
    return () => window.removeEventListener(EVT, handler);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDetail(null);
    window.addEventListener('keydown', onKey);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      html.style.overflow = prev;
    };
  }, [detail]);

  if (!detail) return null;
  const close = () => setDetail(null);
  const heading = detail.title || (detail.property ? `Interested in ${detail.property}?` : 'Get expert property advice');

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={heading}>
      <div className="absolute inset-0 animate-fadeIn bg-ink/70 backdrop-blur-[3px]" onClick={close} />

      <div className="relative flex max-h-[92vh] w-full max-w-[880px] animate-sheetUp flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:max-h-[88vh] sm:animate-zoomIn sm:rounded-[28px] md:flex-row" style={{ maxHeight: 'min(92dvh, 92vh)' }}>
        {/* Mobile header — always visible, holds the close button */}
        <div className="relative flex shrink-0 items-center gap-3 overflow-hidden bg-ink px-5 py-4 text-ivory md:hidden">
          {detail.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={detail.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/50" />
          <div className="relative min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-light">{detail.property ? 'Enquiry for' : 'RealtechX advisors'}</p>
            <p className="truncate font-display text-[17px] font-semibold">{detail.property || 'Free property consultation'}</p>
          </div>
          <button onClick={close} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-ink shadow-md active:scale-95" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <span className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-white/40 md:hidden" />

        {/* Desktop side panel */}
        <div className="relative hidden w-[38%] shrink-0 overflow-hidden bg-ink text-ivory md:block">
          {detail.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={detail.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/40" />
          <div className="relative flex h-full flex-col justify-between p-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-light">The RealtechX advantage</p>
              <ul className="mt-6 space-y-4 text-[14px]">
                {perks.map(({ Icon, t }) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-gold/10"><Icon className="h-4 w-4 text-gold" /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {detail.property && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-light">Enquiry for</p>}
              {detail.property && <p className="mt-1 line-clamp-3 font-display text-2xl font-semibold leading-tight">{detail.property}</p>}
              <a href={`tel:${site.phoneRaw}`} className="mt-4 flex items-center gap-2 text-sm font-semibold text-gold-light hover:text-white">
                <PhoneCall className="h-4 w-4" /> {site.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pt-8">
          <button onClick={close} className="absolute right-5 top-5 hidden h-10 w-10 place-items-center rounded-full bg-ivory text-ink transition hover:bg-ink hover:text-ivory md:grid" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <p className="eyebrow">{detail.intent || 'Enquire now'}</p>
          <h3 className="mt-2 font-display text-[22px] font-semibold leading-tight md:pr-12 md:text-[28px]">{heading}</h3>
          <p className="mb-4 mt-1.5 text-[13.5px] leading-relaxed text-muted md:mb-6 md:text-sm">
            {detail.subtitle || 'Share your details — get the price sheet, floor plans and offers on WhatsApp.'}
          </p>
          <div className="mb-5 flex flex-wrap gap-1.5 md:hidden">
            {perks.map(({ Icon, t }) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-2.5 py-1 text-[11.5px] font-medium text-ink/80">
                <Icon className="h-3 w-3 text-gold-dark" />{t}
              </span>
            ))}
          </div>
          <LeadForm source={detail.source || 'Popup'} property={detail.property} intent={detail.intent} cta={detail.intent || 'Get details now'} />
          <p className="mt-4 hidden items-center gap-1.5 text-[11px] text-muted md:flex"><ShieldCheck className="h-3.5 w-3.5 text-gold-dark" /> Zero brokerage for buyers · No spam</p>
        </div>
      </div>
    </div>
  );
}
