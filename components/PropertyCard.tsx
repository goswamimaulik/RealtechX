'use client';

import Link from 'next/link';
import { BedDouble, Heart, MapPin, Maximize2, Phone } from 'lucide-react';
import type { Property } from '@/lib/types';
import { areaRange, configLabel, priceRange, startPrice, titleCase } from '@/lib/format';
import { getCity } from '@/lib/data/cities';
import { getDeveloper } from '@/lib/data/developers';
import { site } from '@/lib/site';
import SmartImage from './SmartImage';
import { useShortlist } from './useShortlist';
import { openLead } from './LeadModal';

const statusTone: Record<string, string> = {
  'new-launch': 'bg-gold text-ink',
  'under-construction': 'bg-white text-ink',
  'ready-to-move': 'bg-emerald-500 text-white',
};

export default function PropertyCard({ p, layout = 'grid' }: { p: Property; layout?: 'grid' | 'list' }) {
  const { has, toggle } = useShortlist();
  const city = getCity(p.city);
  const dev = getDeveloper(p.developer);
  const saved = has(p.id);
  const list = layout === 'list';

  return (
    <article className={`group flex h-full overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-luxe ${list ? 'flex-col sm:flex-row' : 'flex-col'}`}>
      <div className={`relative shrink-0 overflow-hidden ${list ? 'aspect-[4/3] sm:aspect-auto sm:w-[40%]' : 'aspect-[4/3]'}`}>
        <Link href={`/property/${p.slug}`} aria-label={p.title} className="absolute inset-0">
          <SmartImage
            src={p.images[0]}
            alt={`${p.title}, ${p.locality}`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/10" />
        <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider md:left-3 md:top-3 md:px-2.5 md:py-1 md:text-[10px] ${statusTone[p.status]}`}>
          {titleCase(p.status)}
        </span>
        <button
          onClick={() => toggle(p.id)}
          className={`absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full backdrop-blur transition md:right-3 md:top-3 md:h-9 md:w-9 ${saved ? 'bg-gold text-ink' : 'bg-white/85 text-ink hover:bg-white'}`}
          aria-label={saved ? 'Remove from shortlist' : 'Add to shortlist'}
        >
          <Heart className={`h-3.5 w-3.5 md:h-4 md:w-4 ${saved ? 'fill-current' : ''}`} />
        </button>
        <p className="pointer-events-none absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider text-white/90 md:bottom-3 md:left-3 md:text-[11px]">
          {titleCase(p.type)} · {p.listingFor === 'rent' ? 'Rent' : 'Sale'}
        </p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 md:p-5">
        <p className="font-display text-[16px] font-bold leading-tight text-ink md:text-[22px]"><span className="md:hidden">{startPrice(p)} <span className="font-sans text-[10px] font-semibold text-muted">onwards</span></span><span className="hidden md:inline">{priceRange(p)}</span></p>
        <Link href={`/property/${p.slug}`} className="mt-1 md:mt-1.5">
          <h3 className="line-clamp-1 font-sans text-[13px] font-bold text-ink transition group-hover:text-gold-dark md:text-[15px]">{p.title}</h3>
        </Link>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted md:mt-1 md:text-xs">
          <MapPin className="h-3 w-3 shrink-0 text-gold-dark md:h-3.5 md:w-3.5" />
          <span className="line-clamp-1">{p.locality}, {city?.name}</span>
        </p>
        {list && <p className="mt-3 hidden line-clamp-2 text-sm text-ink/70 sm:block">{p.tagline}</p>}

        <div className="mt-2.5 space-y-1 border-t border-ink/5 pt-2.5 text-[11px] text-ink/70 md:mt-4 md:flex md:flex-wrap md:gap-x-4 md:space-y-0 md:pt-4 md:text-xs">
          <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 shrink-0 text-gold-dark" /><span className="line-clamp-1">{configLabel(p)}</span></span>
          <span className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5 shrink-0 text-gold-dark" /><span className="line-clamp-1">{areaRange(p)}</span></span>
        </div>

        <p className="mt-2 hidden line-clamp-1 text-[11px] text-muted md:block">by <span className="font-semibold text-ink/80">{dev?.name}</span></p>

        <div className="mt-auto flex items-center gap-1.5 pt-3 md:pt-4">
          <button
            onClick={() => openLead({ property: p.title, intent: 'Get Best Price', source: 'Property Card', image: p.images[0] })}
            className="flex-1 rounded-full bg-ink px-3 py-2 text-[11px] font-bold text-ivory transition hover:bg-gold hover:text-ink md:py-2.5 md:text-xs"
          >
            Enquire now
          </button>
          <a href={`tel:${site.phoneRaw}`} className="hidden h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/10 hover:border-gold sm:grid" aria-label="Call">
            <Phone className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
