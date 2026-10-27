'use client';

import { useState } from 'react';
import { Briefcase, ExternalLink, Landmark, MapPin, ShoppingBag, TrainFront } from 'lucide-react';

type Item = { name: string; distance: string };

const groups = [
  { key: 'connectivity', label: 'Connectivity', Icon: TrainFront, test: /metro|station|road|highway|expressway|airport|jetty|nh-|ring|link|mthl|chowk|checkpost|access/i },
  { key: 'work', label: 'Business hubs', Icon: Briefcase, test: /it park|tech|sez|office|business|hitec|financial|gidc|wipro|eon|world trade|bkc|itpl|hazira|industrial|pharma|centre|center|corporate/i },
  { key: 'lifestyle', label: 'Lifestyle', Icon: ShoppingBag, test: /mall|street|market|beach|lake|park|dam|hills|ghat|riverfront|club|ashram|promenade|sea face/i },
];

export default function LocationTabs({ nearby, mapQuery, title }: { nearby: Item[]; mapQuery: string; title: string }) {
  const buckets = groups
    .map((g) => ({ ...g, items: nearby.filter((n) => g.test.test(n.name)) }))
    .filter((g) => g.items.length);
  const used = new Set(buckets.flatMap((b) => b.items.map((i) => i.name)));
  const rest = nearby.filter((n) => !used.has(n.name));
  const tabs = [
    { key: 'all', label: 'All', Icon: MapPin, items: nearby },
    ...buckets,
    ...(rest.length ? [{ key: 'landmarks', label: 'Landmarks', Icon: Landmark, items: rest }] : []),
  ];
  const [active, setActive] = useState('all');
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr] lg:gap-6">
      <div className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-card">
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-ink/5 p-2" role="tablist">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={active === key}
              onClick={() => setActive(key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold transition ${active === key ? 'bg-ink text-ivory' : 'text-ink/70 hover:bg-ivory'}`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
        <ul className="divide-y divide-ink/5">
          {current.items.map((n) => (
            <li key={n.name} className="flex items-center justify-between gap-3 px-4 py-3.5 text-[13.5px] md:px-5">
              <span className="flex min-w-0 items-center gap-2.5 font-semibold">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold-50"><MapPin className="h-4 w-4 text-gold-dark" /></span>
                <span className="truncate">{n.name}</span>
              </span>
              <span className="shrink-0 rounded-full bg-ivory-200 px-3 py-1 text-xs font-bold">{n.distance}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-card md:min-h-[320px]">
        <iframe
          title={`Map of ${title}`}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=13&output=embed`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
          target="_blank"
          rel="noopener"
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold shadow-luxe"
        >
          Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
