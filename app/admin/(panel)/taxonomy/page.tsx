'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import Crud from '@/components/admin/Crud';
import { Badge, PageHeader, Tabs, useApi } from '@/components/admin/ui';

const groups = [
  { value: 'category', label: 'Categories', system: true, text: 'The five main categories. They are built into the website’s URLs (/property-type/…), menus and search.' },
  { value: 'subtype', label: 'Residential & commercial types', system: false, text: 'Apartment, Villa, Office, Shop… shown as “Property type” on listings. Link each to a category.' },
  { value: 'amenity', label: 'Amenities', system: false, text: 'Suggestions offered when adding amenities to a listing.' },
  { value: 'furnishing', label: 'Furnishing', system: false, text: 'Furnishing options for rentals and resale units.' },
  { value: 'status', label: 'Project status', system: true, text: 'Project stages. They are built into the website’s URLs (/status/…) and filters.' },
  { value: 'purpose', label: 'Purpose', system: true, text: 'Buy, rent and lease — chosen on every listing.' },
] as const;

export default function Page() {
  const [g, setG] = useState<(typeof groups)[number]['value']>('subtype');
  const cats = useApi<{ categories: { slug: string; label: string }[] }>('options').data?.categories ?? [];
  const cur = groups.find((x) => x.value === g)!;
  return (
    <div>
      <PageHeader eyebrow="Catalogue" title="Categories & Types" subtitle="Everything used in listing forms, filters and search." />
      <Tabs className="mb-4" value={g} onChange={setG} tabs={groups.map((x) => ({ value: x.value, label: <>{x.system && <Lock className="h-3 w-3 opacity-50" />}{x.label}</> }))} />
      <p className="mb-4 text-[13px] text-ink/55">{cur.text}{cur.system && ' They’re fixed so links never break.'}</p>
      {cur.system ? <SystemList group={g} /> : <Crud
        key={g}
        resource="terms"
        noun={cur.label.replace(/s$/, '').replace(/ies$/, 'y')}
        extraQuery={{ group: g }}
        limit={200}
        canCreate={!cur.system}
        canDelete={!cur.system}
        defaults={{ group: g, parent: g === 'subtype' ? 'residential' : '' }}
        rowTitle={(r) => r.label}
        searchPlaceholder={`Search ${cur.label.toLowerCase()}…`}
        fields={[
          { key: 'label', label: 'Name', required: true, wide: true },
          ...(g === 'subtype' ? [{ key: 'parent', label: 'Category', type: 'select' as const, options: cats.map((c) => ({ value: c.slug, label: c.label })) }] : []),
          { key: 'order', label: 'Display order', type: 'number' as const },
          { key: 'slug', label: 'Slug', type: 'readonly' as const, when: (_d: unknown, isNew: boolean) => !isNew },
        ]}
        columns={[
          { label: 'Name', render: (r) => <span className="font-semibold">{r.label}</span> },
          ...(g === 'subtype' ? [{ label: 'Category', render: (r: { parent?: string }) => <Badge tone="gold">{cats.find((c) => c.slug === r.parent)?.label ?? r.parent ?? '—'}</Badge> }] : []),
          { label: 'Slug', hideSm: true, render: (r) => <code className="text-[12px] text-ink/55">{r.slug}</code> },
          { label: 'Order', hideSm: true, render: (r) => r.order ?? 0 },
        ]}
      />}
    </div>
  );
}

function SystemList({ group }: { group: string }) {
  const { data } = useApi<{ items: { _id: string; slug: string; label: string }[] }>(`terms?group=${group}&limit=50`);
  return (
    <div className="a-card divide-y divide-ink/[0.05]">
      {(data?.items ?? []).map((t) => (
        <div key={t._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
          <span className="font-semibold">{t.label}</span>
          <span className="flex items-center gap-2 text-[12px] text-ink/45"><Lock className="h-3.5 w-3.5" /><code>{t.slug}</code></span>
        </div>
      ))}
    </div>
  );
}
