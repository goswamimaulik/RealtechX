'use client';

import Link from 'next/link';
import { BedDouble, Heart, MapPin, Maximize2, Phone } from 'lucide-react';
import type { Property } from '@/lib/types';
import { areaRange, configLabel, priceRange, titleCase } from '@/lib/format';
import { getCity } from '@/lib/data/cities';
import { getDeveloper } from '@/lib/data/developers';
import SmartImage from './SmartImage';
import { useShortlist } from './useShortlist';
import { openLead } from './LeadModal';

export default function PropertyCard({ p, layout = 'grid' }: { p: Property; layout?: 'grid' | 'list' }) {
  const { has, toggle } = useShortlist();
  const city = getCity(p.city);
  const dev = getDeveloper(p.developer);
  const saved = has(p.id);
  const list = layout === 'list';

  return (
    <article className={`group card overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-luxe ${list ? 'md:flex' : ''}`}>
      <div className={`relative overflow-hidden ${list ? 'aspect-[4/3] md:aspect-auto md:w-[42%] md:shrink-0' : 'aspect-[4/3]'}`}>
        <Link href={`/property/${p.slug}`} aria-label={p.title}>
          <SmartImage
            src={p.images[0]}
            alt={`${p.title}, ${p.locality}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">{titleCase(p.status)}</span>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${p.listingFor === 'rent' ? 'bg-emerald-500 text-white' : 'bg-gold text-ink'}`}>
            For {p.listingFor === 'rent' ? 'Rent' : 'Sale'}
          </span>
        </div>
        <button
          onClick={() => toggle(p.id)}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${saved ? 'bg-gold text-ink' : 'bg-white/80 text-ink hover:bg-white'}`}
          aria-label={saved ? 'Remove from shortlist' : 'Add to shortlist'}
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>
        <p className="absolute bottom-3 left-3 text-xs font-semibold text-white/90">{titleCase(p.type)}</p>
      </div>

      <div className={`flex flex-col p-5 ${list ? 'flex-1 md:p-6' : ''}`}>
        <p className="font-display text-2xl font-semibold text-ink">{priceRange(p)}</p>
        <Link href={`/property/${p.slug}`}>
          <h3 className="mt-1 line-clamp-1 font-sans text-[15px] font-bold text-ink transition group-hover:text-gold-dark">{p.title}</h3>
        </Link>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 text-gold-dark" /> {p.locality}, {city?.name}
        </p>
        {list && <p className="mt-3 line-clamp-2 text-sm text-ink/70">{p.tagline}</p>}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-ink/5 pt-4 text-xs text-ink/70">
          <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-gold-dark" />{configLabel(p)}</span>
          <span className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5 text-gold-dark" />{areaRange(p)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <p className="line-clamp-1 text-[11px] text-muted">by <span className="font-semibold text-ink/80">{dev?.name}</span></p>
          <div className="flex gap-1.5">
            <button
              onClick={() => openLead({ property: p.title, intent: 'Get Best Price', source: 'Property Card', image: p.images[0] })}
              className="rounded-full bg-ink px-3.5 py-2 text-[11px] font-bold text-ivory transition hover:bg-gold hover:text-ink"
            >
              Enquire
            </button>
            <a href="tel:+919773069318" className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 hover:border-gold" aria-label="Call">
              <Phone className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
