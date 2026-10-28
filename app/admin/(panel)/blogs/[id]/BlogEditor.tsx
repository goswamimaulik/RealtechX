'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, ExternalLink } from 'lucide-react';
import { api } from '@/components/admin/api';
import { Card, Counter, ErrorBox, Field, Loading, PageHeader, Repeater, SaveButton, Toggle, useAdmin, useApi, useUnsaved } from '@/components/admin/ui';
import { ImageField } from '@/components/admin/media';

type Sec = { heading: string; body: string };
type F = { title: string; slug: string; excerpt: string; category: string; date: string; city: string; author: string; cover: string; sections: Sec[]; publish: string; seo: { title?: string; description?: string; keywords?: string; noindex?: boolean } };

const blank = (): F => ({ title: '', slug: '', excerpt: '', category: 'Buying Guide', date: new Date().toISOString().slice(0, 10), city: '', author: '', cover: '', sections: [{ heading: '', body: '' }], publish: 'draft', seo: {} });
/* eslint-disable @typescript-eslint/no-explicit-any */
const fromDoc = (d: any): F => ({ ...blank(), ...d, sections: (d.sections ?? []).map((s: any) => ({ heading: s.heading ?? '', body: (s.body ?? []).join('\n\n') })), seo: d.seo ?? {}, city: d.city ?? '' });

export default function BlogEditor({ id: initialId }: { id: string | null }) {
  const [id, setId] = useState<string | null>(initialId);
  const router = useRouter();
  const { toast } = useAdmin();
  const doc = useApi<{ item: any }>(initialId ? `blogs/${encodeURIComponent(initialId)}` : null);
  const cities = useApi<{ cities: { slug: string; name: string }[] }>('options').data?.cities ?? [];
  const [f, setF] = useState<F>(blank);
  const [saved, setSaved] = useState(JSON.stringify(blank()));
  const [busy, setBusy] = useState(false);
  const loaded = useRef(false);
  useEffect(() => {
    if (doc.data?.item && !loaded.current) {
      loaded.current = true;
      const v = fromDoc(doc.data.item);
      setF(v);
      setSaved(JSON.stringify(v));
    }
  }, [doc.data]);
  const dirty = JSON.stringify(f) !== saved;
  useUnsaved(dirty);
  const set = <K extends keyof F>(k: K, v: F[K]) => setF((p) => ({ ...p, [k]: v }));

  const save = async (publish?: string) => {
    setBusy(true);
    try {
      const body = { ...f, publish: publish ?? f.publish, sections: f.sections.map((s) => ({ heading: s.heading, body: s.body })) };
      const r = id ? await api<{ item: any }>(`blogs/${encodeURIComponent(id)}`, { method: 'PUT', body }) : await api<{ item: any }>('blogs', { body });
      const v = fromDoc(r.item);
      setF(v);
      setSaved(JSON.stringify(v));
      toast(publish === 'published' ? 'Published' : 'Saved');
      if (!id) {
        setId(r.item._id);
        loaded.current = true;
        router.replace(`/admin/blogs/${encodeURIComponent(r.item._id)}`);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not save', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (id && doc.error) return <ErrorBox error={doc.error} retry={doc.reload} />;
  if (id && !loaded.current) return <Loading rows={8} />;
  const words = f.sections.reduce((n, s) => n + s.body.split(/\s+/).filter(Boolean).length, 0);

  return (
    <div>
      <PageHeader
        back={{ href: '/admin/blogs', label: 'Blogs' }}
        eyebrow={id ? 'Edit post' : 'New post'}
        title={f.title || 'Untitled post'}
        subtitle={`${words} words · about ${Math.max(1, Math.round(words / 200))} min read`}
        actions={
          <>
            {id && f.publish === 'published' && <a href={`/blog/${f.slug}`} target="_blank" rel="noopener" className="a-btn a-btn-ghost"><ExternalLink className="h-4 w-4" /> View</a>}
            <SaveButton busy={busy} onClick={() => save()}>{dirty ? 'Save' : 'Saved'}</SaveButton>
            {f.publish !== 'published' && <button disabled={busy} onClick={() => save('published')} className="a-btn a-btn-ink"><BadgeCheck className="h-4 w-4" /> Publish</button>}
          </>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <div className="grid gap-4">
              <Field label="Title" required><input className="a-input !text-[17px] font-semibold" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. 7 things to check before buying an under-construction flat" /></Field>
              <Field label="Excerpt" hint="Shown on blog cards and as the default Google description."><textarea className="a-input min-h-[80px]" value={f.excerpt} onChange={(e) => set('excerpt', e.target.value)} /></Field>
            </div>
          </Card>
          <Card title="Article sections">
            <Repeater<Sec>
              items={f.sections}
              onChange={(v) => set('sections', v)}
              blank={{ heading: '', body: '' }}
              addLabel="Add section"
              render={(s, upd, i) => (
                <div className="grid gap-2">
                  <input className="a-input font-semibold" value={s.heading} onChange={(e) => upd({ heading: e.target.value })} placeholder={`Section ${i + 1} heading`} />
                  <textarea className="a-input min-h-[160px] leading-relaxed" value={s.body} onChange={(e) => upd({ body: e.target.value })} placeholder="Write the section. Leave an empty line between paragraphs." />
                </div>
              )}
            />
          </Card>
          <Card title="SEO">
            <div className="grid gap-4">
              <Field label={<span className="flex justify-between">Meta title <Counter value={f.seo.title ?? ''} ideal={[30, 65]} /></span>}><input className="a-input" value={f.seo.title ?? ''} onChange={(e) => set('seo', { ...f.seo, title: e.target.value })} placeholder="Defaults to the post title" /></Field>
              <Field label={<span className="flex justify-between">Meta description <Counter value={f.seo.description ?? ''} ideal={[70, 165]} /></span>}><textarea className="a-input min-h-[70px]" value={f.seo.description ?? ''} onChange={(e) => set('seo', { ...f.seo, description: e.target.value })} placeholder="Defaults to the excerpt" /></Field>
              <Field label="Keywords"><input className="a-input" value={f.seo.keywords ?? ''} onChange={(e) => set('seo', { ...f.seo, keywords: e.target.value })} /></Field>
              <Toggle checked={!!f.seo.noindex} onChange={(v) => set('seo', { ...f.seo, noindex: v })} label="Hide from Google (noindex)" />
            </div>
          </Card>
        </div>
        <aside className="space-y-5">
          <Card title="Publishing">
            <div className="grid gap-4">
              <Field label="Status">
                <select className="a-input" value={f.publish} onChange={(e) => set('publish', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
              <Field label="Publish date"><input type="date" className="a-input" value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
              <Field label="Author" hint="Defaults to your name"><input className="a-input" value={f.author} onChange={(e) => set('author', e.target.value)} /></Field>
              <Field label="URL slug" hint={`/blog/${f.slug || '…'}`}><input className="a-input font-mono" value={f.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto from title" /></Field>
            </div>
          </Card>
          <Card title="Details">
            <div className="grid gap-4">
              <Field label="Cover image"><ImageField value={f.cover} onChange={(v) => set('cover', v)} folder="blog" /></Field>
              <Field label="Category">
                <input className="a-input" list="rtx-blog-cats" value={f.category} onChange={(e) => set('category', e.target.value)} />
                <datalist id="rtx-blog-cats">{['Buying Guide', 'Home Loans', 'Market Insights', 'Legal & RERA', 'Investment', 'Interiors', 'NRI Corner'].map((c) => <option key={c} value={c} />)}</datalist>
              </Field>
              <Field label="Related city" hint="Shows that city’s projects under the article.">
                <select className="a-input" value={f.city} onChange={(e) => set('city', e.target.value)}>
                  <option value="">Featured projects</option>
                  {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </Field>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
