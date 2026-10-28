'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, FileSearch, Globe, Pencil, Settings } from 'lucide-react';
import { api } from '@/components/admin/api';
import { Badge, Card, Counter, Drawer, Empty, ErrorBox, Field, Loading, PageHeader, SaveButton, Tabs, Toggle, useAdmin, useApi } from '@/components/admin/ui';
import { ImageField } from '@/components/admin/media';
import { seoRoutes } from '@/lib/content-defaults';

type Seo = { _id: string; title?: string; description?: string; keywords?: string; ogImage?: string; canonical?: string; noindex?: boolean };
type Audit = { pages: number; healthy: number; score: number; issues: { kind: string; id: string; title: string; href: string; edit: string; problems: string[]; score: number }[] };

const extra = [
  { route: '/privacy-policy', label: 'Privacy policy', title: 'Privacy Policy', description: '' },
  { route: '/terms-and-conditions', label: 'Terms & conditions', title: 'Terms & Conditions', description: '' },
  { route: '/disclaimer', label: 'Disclaimer', title: 'Disclaimer', description: '' },
  ...['residential', 'commercial', 'plot', 'land', 'villa'].map((t) => ({ route: `/property-type/${t}`, label: `Category: ${t}`, title: '', description: '' })),
  ...['new-launch', 'under-construction', 'ready-to-move'].map((s) => ({ route: `/status/${s}`, label: `Status: ${s.replace(/-/g, ' ')}`, title: '', description: '' })),
];

export default function Page() {
  const { toast } = useAdmin();
  const [tab, setTab] = useState<'pages' | 'audit'>('pages');
  const list = useApi<{ items: Seo[] }>('seo?limit=200');
  const audit = useApi<Audit>(tab === 'audit' ? 'seo-audit' : null);
  const [edit, setEdit] = useState<(Seo & { label: string; defTitle: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const overrides = Object.fromEntries((list.data?.items ?? []).map((s) => [s._id, s]));
  const routes = [...seoRoutes, ...extra];

  const save = async () => {
    if (!edit) return;
    setBusy(true);
    try {
      const { label, defTitle, ...body } = edit;
      void label; void defTitle;
      if (overrides[edit._id]) await api(`seo/${encodeURIComponent(edit._id)}`, { method: 'PUT', body });
      else await api('seo', { body: { ...body, route: edit._id } });
      toast('SEO saved');
      setEdit(null);
      list.reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="SEO Management"
        subtitle="Meta titles and descriptions for every page, plus a health check across all listings. Listings, blogs, developers and cities have their own SEO box in their editors."
        actions={
          <>
            <a href="/sitemap.xml" target="_blank" rel="noopener" className="a-btn a-btn-ghost"><Globe className="h-4 w-4" /> Sitemap</a>
            <Link href="/admin/settings?tab=seo" className="a-btn a-btn-ghost"><Settings className="h-4 w-4" /> Global SEO defaults</Link>
          </>
        }
      />
      <Tabs className="mb-5" value={tab} onChange={setTab} tabs={[{ value: 'pages', label: 'Page meta tags' }, { value: 'audit', label: <><FileSearch className="h-3.5 w-3.5" /> SEO health check</> }]} />

      {tab === 'pages' &&
        (list.error ? (
          <ErrorBox error={list.error} retry={list.reload} />
        ) : !list.data ? (
          <Loading />
        ) : (
          <div className="a-card divide-y divide-ink/[0.05]">
            {routes.map((r) => {
              const o = overrides[r.route];
              return (
                <button key={r.route} onClick={() => setEdit({ ...(o ?? {}), _id: r.route, label: r.label, defTitle: r.title })} className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition hover:bg-ivory/60">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-semibold">{r.label}{o?.noindex && <Badge tone="red">noindex</Badge>}</span>
                    <span className="block truncate text-[12.5px] text-[#1a0dab]">{o?.title || r.title || 'Automatic title'}</span>
                    <span className="block truncate text-[12px] text-ink/45">{o?.description || 'Automatic description'}</span>
                  </span>
                  <code className="hidden text-[11.5px] text-ink/40 md:block">{r.route}</code>
                  {o ? <Badge tone="gold">Custom</Badge> : <Badge>Auto</Badge>}
                  <Pencil className="h-4 w-4 shrink-0 text-ink/35" />
                </button>
              );
            })}
          </div>
        ))}

      {tab === 'audit' &&
        (audit.error ? (
          <ErrorBox error={audit.error} retry={audit.reload} />
        ) : !audit.data ? (
          <Loading />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card><p className="a-label">SEO score</p><p className={`font-display text-[44px] font-semibold leading-none ${audit.data.score >= 80 ? 'text-emerald-600' : audit.data.score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{audit.data.score}<span className="text-[20px] text-ink/40">/100</span></p></Card>
              <Card><p className="a-label">Pages checked</p><p className="font-display text-[44px] font-semibold leading-none">{audit.data.pages}</p></Card>
              <Card><p className="a-label">Pages with no issues</p><p className="font-display text-[44px] font-semibold leading-none text-emerald-600">{audit.data.healthy}</p></Card>
            </div>
            {audit.data.issues.length ? (
              <div className="a-card divide-y divide-ink/[0.05]">
                {audit.data.issues.slice(0, 150).map((i) => (
                  <div key={i.kind + i.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2"><Badge tone="gray">{i.kind}</Badge><b className="truncate">{i.title}</b></p>
                      <ul className="mt-1.5 space-y-0.5">
                        {i.problems.map((p) => <li key={p} className="flex items-start gap-1.5 text-[12.5px] text-amber-800"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{p}</li>)}
                      </ul>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <a href={i.href} target="_blank" rel="noopener" className="a-btn a-btn-ghost a-btn-sm"><ExternalLink className="h-3.5 w-3.5" /> View</a>
                      <Link href={i.edit} className="a-btn a-btn-ink a-btn-sm"><Pencil className="h-3.5 w-3.5" /> Fix</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="a-card"><Empty icon={CheckCircle2} title="Everything looks great" text="No SEO issues found on published pages." /></div>
            )}
          </div>
        ))}

      {edit && (
        <Drawer onClose={() => setEdit(null)} title={edit.label} subtitle={edit._id} wide footer={<><button className="a-btn a-btn-ghost" onClick={() => setEdit(null)}>Cancel</button><SaveButton busy={busy} onClick={save} /></>}>
          <div className="mb-5 rounded-2xl border border-ink/[0.07] bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">Google preview</p>
            <p className="mt-2 truncate text-[18px] text-[#1a0dab]">{edit.title || edit.defTitle || edit.label}</p>
            <p className="line-clamp-2 text-[13px] text-ink/65">{edit.description || 'Automatic description from the page content.'}</p>
          </div>
          <div className="grid gap-4">
            <Field label={<span className="flex justify-between">Meta title <Counter value={edit.title ?? ''} ideal={[30, 65]} /></span>} hint="Shown exactly as written (the site name is not appended)."><input className="a-input" value={edit.title ?? ''} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder={edit.defTitle} /></Field>
            <Field label={<span className="flex justify-between">Meta description <Counter value={edit.description ?? ''} ideal={[70, 165]} /></span>}><textarea className="a-input min-h-[90px]" value={edit.description ?? ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <Field label="Keywords" hint="Comma separated"><input className="a-input" value={edit.keywords ?? ''} onChange={(e) => setEdit({ ...edit, keywords: e.target.value })} /></Field>
            <Field label="Canonical URL"><input className="a-input" value={edit.canonical ?? ''} onChange={(e) => setEdit({ ...edit, canonical: e.target.value })} placeholder={edit._id} /></Field>
            <Field label="Social share image"><ImageField value={edit.ogImage ?? ''} onChange={(v) => setEdit({ ...edit, ogImage: v })} folder="banners" aspect="aspect-[1200/630]" /></Field>
            <Toggle checked={!!edit.noindex} onChange={(v) => setEdit({ ...edit, noindex: v })} label="Hide from Google (noindex)" />
          </div>
        </Drawer>
      )}
    </div>
  );
}
