'use client';

import { useEffect, useState } from 'react';
import { BadgePercent, CalendarCheck, FileText, PhoneCall, X } from 'lucide-react';
import LeadForm from './LeadForm';
import { site } from '@/lib/site';

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

  useEffect(() => {
    const handler = (e: Event) => setDetail((e as CustomEvent<LeadModalDetail>).detail || {});
    window.addEventListener(EVT, handler);
    return () => window.removeEventListener(EVT, handler);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDetail(null);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [detail]);

  if (!detail) return null;
  const close = () => setDetail(null);
  const heading = detail.title || (detail.property ? `Interested in ${detail.property}?` : 'Get expert property advice');

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={heading}>
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-[3px]" onClick={close} />

      <div className="relative flex max-h-[94dvh] w-full max-w-[860px] animate-fadeUp flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:animate-zoomIn sm:rounded-[28px] md:flex-row">
        <button onClick={close} className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-md backdrop-blur hover:bg-white" aria-label="Close">
          <X className="h-4 w-4" />
        </button>

        {/* Visual panel — banner on mobile, side panel on desktop */}
        <div className="relative min-h-[110px] shrink-0 overflow-hidden bg-ink text-ivory md:min-h-0 md:w-[40%]">
          {detail.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={detail.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
          <div className="relative flex h-full flex-col justify-end p-5 pt-10 md:justify-between md:p-8">
            <div className="hidden md:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-gold-light">The RealtechX advantage</p>
              <ul className="mt-6 space-y-4 text-sm">
                {perks.map(({ Icon, t }) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-gold/10"><Icon className="h-4 w-4 text-gold" /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {detail.property && <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold-light md:mt-8">Enquiry for</p>}
              {detail.property ? (
                <p className="mt-1 line-clamp-2 font-display text-xl font-semibold leading-tight md:text-2xl">{detail.property}</p>
              ) : (
                <p className="font-display text-xl font-semibold leading-tight md:hidden">Realtech<span className="gold-text">X</span> advisors</p>
              )}
              <a href={`tel:${site.phoneRaw}`} className="mt-3 hidden items-center gap-2 text-sm font-semibold text-gold-light md:flex">
                <PhoneCall className="h-4 w-4" /> {site.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 pb-7 sm:p-7 md:p-9">
          <p className="eyebrow">{detail.intent || 'Enquire now'}</p>
          <h3 className="mt-2 pr-8 font-display text-[22px] font-semibold leading-tight md:text-[30px]">{heading}</h3>
          <p className="mb-4 mt-1.5 text-[13px] text-muted md:mb-6 md:text-sm">
            {detail.subtitle || 'Share your details — get the price sheet, floor plans and offers on WhatsApp.'}
          </p>
          <div className="mb-5 flex flex-wrap gap-1.5 md:hidden">
            {perks.map(({ Icon, t }) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-2.5 py-1 text-[11px] font-semibold text-ink/80">
                <Icon className="h-3 w-3 text-gold-dark" />{t}
              </span>
            ))}
          </div>
          <LeadForm source={detail.source || 'Popup'} property={detail.property} intent={detail.intent} cta={detail.intent || 'Get details now'} />
        </div>
      </div>
    </div>
  );
}
