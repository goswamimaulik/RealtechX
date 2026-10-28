'use client';

import { useEffect } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { openLead } from '../LeadModal';

/** Bottom action bar on phones/tablets. Adds body padding so it never covers the footer. */
export default function MobileStickyBar({ title, id, price, image, wa, tel }: { title: string; id: string; price: string; image: string; wa: string; tel: string }) {
  useEffect(() => {
    document.body.classList.add('has-sticky-bar');
    return () => document.body.classList.remove('has-sticky-bar');
  }, []);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-12px_30px_-18px_rgba(11,16,32,.35)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] text-muted">{title}</p>
          <p className="truncate font-display text-[17px] font-semibold leading-tight">{price}</p>
        </div>
        <a href={`tel:${tel}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink/15 active:scale-95" aria-label="Call"><Phone className="h-4 w-4" /></a>
        <a href={wa} target="_blank" rel="noopener" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white active:scale-95" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
        <button type="button" onClick={() => openLead({ property: title, intent: 'Get Best Price', source: `Mobile Sticky Bar (${id})`, image })} className="btn-gold shine shrink-0 !px-5 !py-3">
          Enquire
        </button>
      </div>
    </div>
  );
}
