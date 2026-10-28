'use client';

import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { openLead } from '../LeadModal';

export default function Amenities({ items, initial = 8, property }: { items: string[]; initial?: number; property?: string }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, initial);
  if (!items.length) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-ink/15 bg-white p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <p className="text-[14px] text-ink/70">The full amenity list for {property ?? 'this project'} is available on request — we’ll share it with the brochure.</p>
        <button type="button" onClick={() => openLead({ property, intent: 'Get Amenity List', source: 'Amenities (on request)' })} className="btn-ink shine shrink-0 !py-2.5 text-[13px]">
          Get amenity list
        </button>
      </div>
    );
  }
  return (
    <div>
      <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
        {shown.map((a) => (
          <li key={a} className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-ink/[0.07] bg-white px-3 py-3 md:px-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-50"><Sparkles className="h-4 w-4 text-gold-dark" /></span>
            <span className="min-w-0 text-[13px] font-medium leading-snug md:text-[13.5px]">{a}</span>
          </li>
        ))}
      </ul>
      {items.length > initial && (
        <button type="button" onClick={() => setAll((v) => !v)} className="btn-outline mt-4 !py-2.5 text-[13px]" aria-expanded={all}>
          {all ? 'Show fewer amenities' : `View all ${items.length} amenities`}
          <ChevronDown className={`h-4 w-4 transition ${all ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}
