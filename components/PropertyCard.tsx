'use client';

import Link from 'next/link';
import { Heart, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { CardProperty } from '@/lib/types';
import { areaCompact, configLabel, contactOf, priceRange, titleCase } from '@/lib/format';
import { useSite } from './SiteContext';
import SmartImage from './SmartImage';
import { useShortlist } from './useShortlist';
import { openLead } from './LeadModal';

const statusTone: Record<string, string> = {
  'new-launch': 'bg-gold text-ink',
  'under-construction': 'bg-white text-ink',
  'ready-to-move': 'bg-emerald-500 text-white',
};

const typeNoun: Record<string, string> = {
  residential: 'Apartments',
  commercial: 'Commercial',
  plot: 'Plots',
  land: 'Land',
  villa: 'Villas',
};
const typeBadge: Record<string, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  plot: 'Plot',
  land: 'Land',
  villa: 'Villa',
};

export default function PropertyCard({ p, layout = 'grid' }: { p: CardProperty; layout?: 'grid' | 'list' }) {
  const { has, toggle } = useShortlist();
  const site = useSite();
  const saved = has(p.id);
  const list = layout === 'list';
  const contact = contactOf(p, site);
  const wa = `https://wa.me/${contact.wa}?text=${encodeURIComponent(`Hi, I'm interested in ${p.title} (${p.id}).`)}`;

  return (
    <article className={`group relative flex h-full overflow-hidden rounded-[20px] border border-ink/[0.07] bg-white shadow-[0_6px_24px_-14px_rgba(11,16,32,.25)] transition duration-300 hover:-translate-y-1 hover:shadow-luxe ${list ? 'flex-col sm:flex-row' : 'flex-col'}`}>
      <div className={`relative shrink-0 overflow-hidden ${list ? 'aspect-[16/11] sm:aspect-auto sm:w-[42%]' : 'aspect-[16/11]'}`}>
        <Link href={`/property/${p.slug}`} aria-label={p.title} className="absolute inset-0">
          <SmartImage src={p.image} alt={`${p.title}, ${p.locality}`} fill sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw" className="object-cover transition duration-700 group-hover:scale-[1.06]" />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/10" />
        <div className="pointer-events-none absolute left-3 right-14 top-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-sm ${statusTone[p.status]}`}>{titleCase(p.status)}</span>
          <span className="rounded-full bg-ink/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            {typeBadge[p.type]}{p.listingFor === 'rent' ? ' · Rent' : ''}
          </span>
        </div>
        <button
          onClick={() => toggle(p.id)}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition active:scale-90 ${saved ? 'bg-gold text-ink' : 'bg-white/90 text-ink hover:bg-white'}`}
          aria-label={saved ? 'Remove from shortlist' : 'Add to shortlist'}
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>
        {p.developerName && <p className="pointer-events-none absolute bottom-3 left-3 right-3 truncate text-[12px] font-medium text-white/90">by {p.developerName}</p>}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
        <Link href={`/property/${p.slug}`}>
          <h3 className="truncate font-display text-[18px] font-semibold leading-tight text-ink transition group-hover:text-gold-dark">{p.title}</h3>
        </Link>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gold-dark" />
          <span className="truncate">{p.locality}, {p.cityName}</span>
        </p>

        <p className="mt-3 font-display text-[21px] font-semibold leading-none text-ink">{priceRange(p)}</p>

        <dl className="mt-4 grid grid-cols-3 divide-x divide-ink/[0.07] rounded-xl bg-ivory/80 py-2.5 text-center">
          {[
            { k: 'Config', v: p.bhk.length ? configLabel(p) : typeNoun[p.type] },
            { k: 'Area', v: areaCompact(p) },
            { k: 'Possession', v: p.possession.replace('Ready for construction', 'Ready') },
          ].map((f) => (
            <div key={f.k} className="min-w-0 px-2">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">{f.k}</dt>
              <dd className="mt-0.5 truncate text-[12.5px] font-semibold text-ink" title={f.v}>{f.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <button
            onClick={() => openLead({ property: p.title, intent: 'Get Best Price', source: 'Property Card', image: p.image })}
            className="btn-ink flex-1 !px-4 !py-2.5 text-[13px]"
          >
            Enquire now
          </button>
          <a href={wa} target="_blank" rel="noopener" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/10 text-[#1DA851] transition hover:border-[#25D366] hover:bg-[#25D366] hover:text-white" aria-label="WhatsApp">
            <MessageCircle className="h-4 w-4" />
          </a>
          <a href={`tel:${contact.tel}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/10 transition hover:border-gold hover:bg-gold hover:text-ink" aria-label="Call">
            <Phone className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
