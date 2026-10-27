'use client';

import { useEffect, useState } from 'react';
import { BadgePercent, CalendarCheck, Phone, X } from 'lucide-react';
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
    return () => window.removeEventListener('keydown', onKey);
  }, [detail]);

  if (!detail) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setDetail(null)} />
      <div className="relative grid w-full max-w-3xl animate-zoomIn overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-5">
        <button onClick={() => setDetail(null)} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-ink/5 hover:bg-ink/10" aria-label="Close">
          <X className="h-4 w-4" />
        </button>

        <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-7 text-ivory md:col-span-2 md:flex">
          {detail.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={detail.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          )}
          <div className="relative">
            <p className="eyebrow !text-gold-light">RealtechX Advantage</p>
            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex gap-3"><BadgePercent className="h-5 w-5 shrink-0 text-gold" /> Best price & exclusive offers</li>
              <li className="flex gap-3"><CalendarCheck className="h-5 w-5 shrink-0 text-gold" /> Free site visit with pickup</li>
              <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-gold" /> Instant call back from an advisor</li>
            </ul>
          </div>
          <a href={`tel:${site.phoneRaw}`} className="relative mt-8 text-sm font-semibold text-gold-light">{site.phone}</a>
        </div>

        <div className="p-6 md:col-span-3 md:p-8">
          <p className="eyebrow">{detail.intent || 'Enquire Now'}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-tight md:text-3xl">
            {detail.title || (detail.property ? `Interested in ${detail.property}?` : 'Get expert property advice')}
          </h3>
          <p className="mb-5 mt-1.5 text-sm text-muted">
            {detail.subtitle || 'Share your details and get price sheet, floor plans and offers on WhatsApp.'}
          </p>
          <LeadForm
            source={detail.source || 'Popup'}
            property={detail.property}
            intent={detail.intent}
            cta={detail.intent || 'Get Details Now'}
          />
        </div>
      </div>
    </div>
  );
}
