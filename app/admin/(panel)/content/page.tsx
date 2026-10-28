'use client';

import Link from 'next/link';
import { ArrowUpRight, FileText, Home, Info, Mail, PanelBottom, Scale } from 'lucide-react';
import { when } from '@/components/admin/api';
import { ErrorBox, Loading, PageHeader, useApi } from '@/components/admin/ui';

type Item = { _id: string; label: string; legal: boolean; slug: string; updatedAt: string };
const meta: Record<string, { icon: React.ElementType; text: string; href: string }> = {
  home: { icon: Home, text: 'Hero banner & search, featured projects, why-choose-us, sell CTA, popular localities.', href: '/' },
  about: { icon: Info, text: 'Story, values and FAQs.', href: '/about' },
  contact: { icon: Mail, text: 'Hero, map location and FAQs. Phone, email & address come from Settings.', href: '/contact' },
  footer: { icon: PanelBottom, text: 'Footer description and bottom note. Social links come from Settings.', href: '/' },
};

export default function Page() {
  const { data, error, reload } = useApi<{ items: Item[] }>('content');
  if (error) return <ErrorBox error={error} retry={reload} />;
  if (!data) return <Loading />;
  const pages = data.items.filter((i) => !i.legal);
  const legal = data.items.filter((i) => i.legal);
  return (
    <div>
      <PageHeader eyebrow="Content" title="Pages & Content" subtitle="Edit the text and images of every page. Changes go live within seconds." />
      <div className="grid gap-4 md:grid-cols-2">
        {pages.map((p) => {
          const m = meta[p._id] ?? { icon: FileText, text: '', href: '/' };
          return (
            <Link key={p._id} href={`/admin/content/${encodeURIComponent(p._id)}`} className="a-card group flex gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-luxe">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-gold-light"><m.icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between font-display text-[22px] font-semibold">{p.label}<ArrowUpRight className="h-4 w-4 text-ink/30 transition group-hover:text-gold-dark" /></span>
                <span className="mt-1 block text-[13px] text-ink/55">{m.text}</span>
                {p.updatedAt && <span className="mt-2 block text-[11.5px] text-ink/40">Updated {when(p.updatedAt)}</span>}
              </span>
            </Link>
          );
        })}
      </div>
      <h2 className="mb-3 mt-10 text-[13px] font-bold uppercase tracking-[0.12em] text-ink/60">Legal pages</h2>
      <div className="a-card divide-y divide-ink/[0.05]">
        {legal.map((p) => (
          <Link key={p._id} href={`/admin/content/${encodeURIComponent(p._id)}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-ivory/60">
            <Scale className="h-4 w-4 text-gold-dark" />
            <span className="flex-1 font-semibold">{p.label}</span>
            <span className="hidden text-[12px] text-ink/45 sm:inline">/{p.slug}</span>
            <ArrowUpRight className="h-4 w-4 text-ink/30" />
          </Link>
        ))}
      </div>
    </div>
  );
}
