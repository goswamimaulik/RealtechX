'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExternalLink, Star } from 'lucide-react';
import Crud from '@/components/admin/Crud';
import { Badge, PageHeader, Tabs, useApi } from '@/components/admin/ui';
import { thumb } from '@/components/admin/media';

type Opts = { states: { slug: string; name: string }[]; cities: { slug: string; name: string; state: string }[] };

function View() {
  const sp = useSearchParams();
  const [tab, setTab] = useState<'states' | 'cities' | 'localities'>((sp.get('tab') as 'cities') || 'cities');
  const [city, setCity] = useState('');
  const opts = useApi<Opts>('options', [tab]);
  const states = opts.data?.states ?? [];
  const cities = opts.data?.cities ?? [];
  const cityName = Object.fromEntries(cities.map((c) => [c.slug, c.name]));
  const edit = sp.get('edit');

  return (
    <div>
      <PageHeader eyebrow="Catalogue" title="Locations" subtitle="States, cities and localities power the city pages, locality pages, search and filters." />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'states', label: 'States', count: states.length },
          { value: 'cities', label: 'Cities', count: cities.length },
          { value: 'localities', label: 'Localities' },
        ]}
      />
      {tab === 'states' && (
        <Crud
          resource="states"
          noun="State"
          onSaved={opts.reload}
          searchPlaceholder="Search states…"
          fields={[
            { key: 'name', label: 'State name', required: true, wide: true },
            { key: 'reraName', label: 'RERA authority name', placeholder: 'e.g. MahaRERA' },
            { key: 'reraUrl', label: 'RERA portal URL', placeholder: 'https://' },
          ]}
          columns={[
            { label: 'State', render: (r) => <span className="font-semibold">{r.name}</span> },
            { label: 'RERA authority', render: (r) => r.reraUrl ? <a href={r.reraUrl} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-gold-dark hover:underline">{r.reraName || 'Portal'} <ExternalLink className="h-3 w-3" /></a> : <span className="text-ink/40">—</span> },
          ]}
        />
      )}
      {tab === 'cities' && (
        <Crud
          resource="cities"
          noun="City"
          editParam={edit}
          onSaved={opts.reload}
          defaults={{ stateSlug: states[0]?.slug ?? '', popular: true, order: cities.length }}
          searchPlaceholder="Search cities…"
          filters={[{ key: 'stateSlug', label: 'All states', options: states.map((s) => ({ value: s.slug, label: s.name })) }]}
          fields={[
            { key: 'name', label: 'City name', required: true },
            { key: 'stateSlug', label: 'State', type: 'select', options: states.map((s) => ({ value: s.slug, label: s.name })), hint: 'Add a state first if it’s missing.' },
            { key: 'image', label: 'City image', type: 'image', folder: 'banners' },
            { key: 'blurb', label: 'Short description', type: 'textarea', rows: 3, hint: 'Shown on the city page hero and in city tabs.' },
            { key: 'order', label: 'Display order', type: 'number', hint: 'Lower numbers show first in menus.' },
            { key: 'popular', label: 'Popular city', type: 'toggle', hint: 'Show in the header menu and home page city tabs.' },
            { key: 'seo', label: 'SEO', type: 'seo' },
          ]}
          columns={[
            {
              label: 'City',
              render: (r) => (
                <span className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <span className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-ivory-200">{r.image && <img src={thumb(r.image, 140)} alt="" className="h-full w-full object-cover" />}</span>
                  <span><span className="flex items-center gap-1.5 font-semibold">{r.name}{r.popular && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}</span><span className="block text-[12px] text-ink/50">{r.state}</span></span>
                </span>
              ),
            },
            { label: 'Order', hideSm: true, render: (r) => r.order ?? 0 },
            { label: 'Page', render: (r) => <a href={`/city/${r.slug}`} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-[12.5px] text-gold-dark hover:underline">/city/{r.slug} <ExternalLink className="h-3 w-3" /></a> },
          ]}
        />
      )}
      {tab === 'localities' && (
        <Crud
          resource="localities"
          noun="Locality"
          onSaved={opts.reload}
          limit={50}
          extraQuery={city ? { city } : {}}
          defaults={{ city: city || cities[0]?.slug || '', popular: false }}
          searchPlaceholder="Search localities…"
          toolbar={
            <select className="a-input sm:w-52" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          }
          fields={[
            { key: 'name', label: 'Locality name', required: true },
            { key: 'city', label: 'City', type: 'select', options: cities.map((c) => ({ value: c.slug, label: c.name })) },
            { key: 'image', label: 'Locality image', type: 'image', folder: 'banners', hint: 'Optional — otherwise a listing photo is used.' },
            { key: 'about', label: 'About this locality', type: 'textarea', rows: 5, hint: 'Shown on the locality page (great for SEO). Empty line between paragraphs.' },
            { key: 'popular', label: 'Popular locality', type: 'toggle', hint: 'Shown in “Popular localities” on the home page.' },
            { key: 'seo', label: 'SEO', type: 'seo' },
          ]}
          columns={[
            { label: 'Locality', render: (r) => <span><span className="flex items-center gap-1.5 font-semibold">{r.name}{r.popular && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}</span><span className="block text-[12px] text-ink/50">{cityName[r.city] ?? r.city}</span></span> },
            { label: 'Page', render: (r) => <a href={`/city/${r.city}/${r.slug}`} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-[12.5px] text-gold-dark hover:underline">/{r.city}/{r.slug} <ExternalLink className="h-3 w-3" /></a> },
            { label: 'Popular', hideSm: true, render: (r) => (r.popular ? <Badge tone="gold">Popular</Badge> : <span className="text-ink/35">—</span>) },
          ]}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <View />
    </Suspense>
  );
}
