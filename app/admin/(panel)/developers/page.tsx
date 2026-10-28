'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Crud, { type FieldDef } from '@/components/admin/Crud';
import { Badge, PageHeader, publishTone, useApi } from '@/components/admin/ui';
import { thumb } from '@/components/admin/media';

type Opts = { cities: { slug: string; name: string }[] };

function View() {
  const sp = useSearchParams();
  const opts = useApi<Opts>('options').data;
  const cities = opts?.cities ?? [];
  const cityName = Object.fromEntries(cities.map((c) => [c.slug, c.name]));
  const fields: FieldDef[] = [
    { key: 'name', label: 'Developer name', required: true, wide: true, placeholder: 'e.g. Godrej Properties' },
    { key: 'logo', label: 'Logo', type: 'logo', folder: 'logos', hint: 'Transparent PNG or SVG works best.' },
    { key: 'cover', label: 'Cover image', type: 'image', folder: 'developers' },
    { key: 'tagline', label: 'Tagline', wide: true, placeholder: 'One line about the developer' },
    { key: 'city', label: 'Head office city', type: 'select', options: [{ value: '', label: '—' }, ...cities.map((c) => ({ value: c.slug, label: c.name }))] },
    { key: 'established', label: 'Established (year)', type: 'number', placeholder: 'e.g. 1990 (leave empty if unknown)' },
    { key: 'about', label: 'Profile / about', type: 'textarea', rows: 7, hint: 'Leave an empty line between paragraphs.' },
    { key: 'specialties', label: 'Specialties', type: 'tags', suggestions: ['Luxury residences', 'Townships', 'Commercial', 'Plotted developments', 'Villas', 'Affordable housing', 'Green buildings'] },
    { key: 'phone', label: 'Contact phone' },
    { key: 'email', label: 'Contact email', type: 'email' },
    { key: 'website', label: 'Website', wide: true, placeholder: 'https://' },
    { key: 'publish', label: 'Visibility', type: 'select', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Hidden' }] },
    { key: 'real', label: 'Real company (profile kept factual)', type: 'toggle', hint: 'Turn on for real developers so the site shows neutral, factual text only.' },
    { key: 'seo', label: 'SEO', type: 'seo' },
  ];
  return (
    <div>
      <PageHeader eyebrow="Listings" title="Builders / Developers" subtitle="Each developer gets a profile page listing all their projects." />
      <Crud
        resource="developers"
        noun="Developer"
        editParam={sp.get('edit')}
        defaults={{ publish: 'published', specialties: [] }}
        searchPlaceholder="Search developers…"
        filters={[{ key: 'city', label: 'All cities', options: cities.map((c) => ({ value: c.slug, label: c.name })) }]}
        fields={fields}
        columns={[
          {
            label: 'Developer',
            render: (r) => (
              <span className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-ink/10 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.logo ? <img src={thumb(r.logo, 120)} alt="" className="h-full w-full object-contain p-1" /> : <span className="font-display text-[15px] font-bold text-gold-dark">{r.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('')}</span>}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{r.name}</span>
                  <span className="block truncate text-[12px] text-ink/50">{r.tagline}</span>
                </span>
              </span>
            ),
          },
          { label: 'City', hideSm: true, render: (r) => cityName[r.city] ?? '—' },
          { label: 'Since', hideSm: true, render: (r) => r.established || '—' },
          { label: 'Visibility', render: (r) => <Badge tone={publishTone(r.publish)}>{r.publish === 'draft' ? 'hidden' : 'published'}</Badge> },
        ]}
      />
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
