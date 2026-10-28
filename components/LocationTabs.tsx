'use client';

import { useState } from 'react';
import { Briefcase, Car, ExternalLink, Landmark, MapPin, Navigation, ShoppingBag, TrainFront } from 'lucide-react';

type Item = { name: string; distance: string };

const groups = [
  { key: 'connectivity', label: 'Connectivity', Icon: TrainFront, test: /metro|station|road|highway|expressway|airport|jetty|nh-|ring|link|mthl|chowk|checkpost|access/i },
  { key: 'work', label: 'Business hubs', Icon: Briefcase, test: /it park|tech|sez|office|business|hitec|financial|gidc|wipro|eon|world trade|bkc|itpl|hazira|industrial|pharma|centre|center|corporate|phase/i },
  { key: 'lifestyle', label: 'Lifestyle', Icon: ShoppingBag, test: /mall|street|market|beach|lake|park|dam|hills|ghat|riverfront|club|ashram|promenade|sea face/i },
];

const km = (d: string) => parseFloat(d.replace(/[^\d.]/g, '')) || 0;
const driveMin = (d: string) => Math.max(2, Math.round(km(d) * 2.2));

/** "Locality report" — nearby places grouped into tabs, with distance + estimated drive time and a map. */
export default function LocationTabs({ nearby, mapQuery, title, locality, zoom = 13 }: { nearby: Item[]; mapQuery: string; title: string; locality?: string; zoom?: number }) {
  const used = new Set<string>();
  const buckets = groups
    .map((g) => {
      const items = nearby.filter((n) => !used.has(n.name) && g.test.test(n.name));
      items.forEach((i) => used.add(i.name));
      return { ...g, items };
    })
    .filter((g) => g.items.length);
  const rest = nearby.filter((n) => !used.has(n.name));
  const tabs = [
    { key: 'all', label: 'All places', Icon: MapPin, items: nearby },
    ...buckets,
    ...(rest.length ? [{ key: 'landmarks', label: 'Landmarks', Icon: Landmark, items: rest }] : []),
  ];
  const [active, setActive] = useState('all');
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  const sorted = [...current.items].sort((a, b) => km(a.distance) - km(b.distance));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  if (!nearby.length) {
    return (
      <div className="overflow-hidden rounded-[22px] border border-ink/[0.07] bg-white shadow-[0_6px_24px_-14px_rgba(11,16,32,.25)]">
        <div className="flex flex-col gap-3 border-b border-ink/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark">Locality report</p>
            <p className="mt-1 font-display text-[19px] font-semibold">Around {title}{locality ? `, ${locality}` : ''}</p>
            <p className="mt-1 text-[13px] text-muted">Detailed distances to schools, hospitals, offices and transit are available on request.</p>
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener" className="btn-outline shrink-0 !py-2.5 text-[13px]">Open in Google Maps <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
        <div className="relative h-[300px] bg-ivory lg:h-[380px]">
          <iframe title={`Map of ${title}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=${zoom}&output=embed`} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-ink/[0.07] bg-white shadow-[0_6px_24px_-14px_rgba(11,16,32,.25)]">
      <div className="flex flex-col gap-1 border-b border-ink/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark">Locality report</p>
          <p className="mt-1 font-display text-[18px] font-semibold">Around {title}{locality ? `, ${locality}` : ''}</p>
        </div>
        <a href={mapsUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold-dark hover:underline">
          Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-ink/[0.06] px-4 py-3 md:flex-wrap md:overflow-visible md:px-6" role="tablist">
            {tabs.map(({ key, label, Icon, items }) => (
              <button
                key={key}
                role="tab"
                aria-selected={active === key}
                onClick={() => setActive(key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition ${active === key ? 'bg-ink text-ivory' : 'bg-ivory text-ink/75 hover:bg-ivory-200'}`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
                <span className={`rounded-full px-1.5 text-[11px] ${active === key ? 'bg-white/15' : 'bg-white'}`}>{items.length}</span>
              </button>
            ))}
          </div>
          <ul key={active} className="animate-fadeIn divide-y divide-ink/[0.06]">
            {sorted.map((n) => (
              <li key={n.name} className="flex items-center gap-3 px-4 py-3.5 md:px-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-50"><Navigation className="h-4 w-4 text-gold-dark" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{n.name}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[12px] text-muted"><Car className="h-3 w-3" /> ~{driveMin(n.distance)} min drive</span>
                </span>
                <span className="shrink-0 rounded-full bg-ivory-200 px-3 py-1 text-[12.5px] font-semibold">{n.distance}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-h-[260px] border-t border-ink/[0.06] bg-ivory lg:min-h-[360px] lg:border-l lg:border-t-0">
          <iframe
            title={`Map of ${title}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=${zoom}&output=embed`}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
      <p className="border-t border-ink/[0.06] px-4 py-3 text-[11.5px] text-muted md:px-6">Distances and drive times are approximate and may vary with traffic.</p>
    </div>
  );
}
