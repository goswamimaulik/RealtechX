'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Search, Star, X } from 'lucide-react';
import { api, qs } from '@/components/admin/api';
import { Card, ErrorBox, Field, Loading, PageHeader, Repeater, SaveButton, useAdmin, useApi, useUnsaved } from '@/components/admin/ui';
import { ImageField } from '@/components/admin/media';

const titles: Record<string, string> = { home: 'Home page', about: 'About us', contact: 'Contact page', footer: 'Footer' };
const links: Record<string, string> = { home: '/', about: '/about', contact: '/contact', footer: '/' };

/** Text input bound to a key. */
function T({ d, k, set, label, area = false, hint, rows = 3, placeholder }: { d: any; k: string; set: (k: string, v: any) => void; label: string; area?: boolean; hint?: string; rows?: number; placeholder?: string }) {
  return (
    <Field label={label} hint={hint}>
      {area ? <textarea className="a-input" style={{ minHeight: rows * 24 + 20 }} value={d[k] ?? ''} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} /> : <input className="a-input" value={d[k] ?? ''} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} />}
    </Field>
  );
}

const Lines = ({ d, k, set, label, hint }: { d: any; k: string; set: (k: string, v: any) => void; label: string; hint?: string }) => (
  <Field label={label} hint={hint ?? 'One per line'}>
    <textarea className="a-input min-h-[110px]" value={(d[k] ?? []).join('\n')} onChange={(e) => set(k, e.target.value.split('\n'))} />
  </Field>
);

const Paras = ({ d, k, set, label }: { d: any; k: string; set: (k: string, v: any) => void; label: string }) => (
  <Field label={label} hint="Leave an empty line between paragraphs.">
    <textarea className="a-input min-h-[200px] leading-relaxed" value={(d[k] ?? []).join('\n\n')} onChange={(e) => set(k, e.target.value.split(/\n{2,}/))} />
  </Field>
);

function Faqs({ d, set }: { d: any; set: (k: string, v: any) => void }) {
  return (
    <Repeater<{ q: string; a: string }>
      items={d.faqs ?? []}
      onChange={(v) => set('faqs', v)}
      blank={{ q: '', a: '' }}
      addLabel="Add question"
      render={(x, upd) => (
        <div className="grid gap-2">
          <input className="a-input font-semibold" value={x.q} onChange={(e) => upd({ q: e.target.value })} placeholder="Question" />
          <textarea className="a-input min-h-[80px]" value={x.a} onChange={(e) => upd({ a: e.target.value })} placeholder="Answer" />
        </div>
      )}
    />
  );
}

/** Pick listings to feature on the home page. */
function FeaturedPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<{ _id: string; title: string; locality: string }[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!value.length) return;
    api<{ items: { _id: string; title: string }[] }>(`properties${qs({ limit: 100, publish: 'published' })}`)
      .then((r) => setNames(Object.fromEntries(r.items.map((i) => [i._id, i.title]))))
      .catch(() => {});
  }, [value.length]);
  useEffect(() => {
    if (q.trim().length < 2) return setRes([]);
    const t = window.setTimeout(() => {
      api<{ items: { _id: string; title: string; locality: string }[] }>(`properties${qs({ q, limit: 8, publish: 'published' })}`).then((r) => setRes(r.items)).catch(() => {});
    }, 300);
    return () => window.clearTimeout(t);
  }, [q]);
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((id) => (
          <span key={id} className="inline-flex items-center gap-1 rounded-lg bg-gold-50 py-1 pl-2.5 pr-1 text-[12.5px] font-medium ring-1 ring-gold/25">
            <Star className="h-3 w-3 fill-gold text-gold" />{names[id] ?? id}
            <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((x) => x !== id))} className="grid h-5 w-5 place-items-center rounded-md hover:bg-white"><X className="h-3 w-3" /></button>
          </span>
        ))}
        {!value.length && <span className="text-[12.5px] text-ink/45">Automatic — listings marked “Featured” are shown.</span>}
      </div>
      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
        <input className="a-input !pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a published listing to add…" />
        {res.length > 0 && (
          <div className="absolute inset-x-0 top-full z-20 mt-1 rounded-xl border border-ink/10 bg-white p-1 shadow-luxe">
            {res.map((r) => (
              <button
                key={r._id}
                type="button"
                onClick={() => {
                  if (!value.includes(r._id)) onChange([...value, r._id]);
                  setNames((n) => ({ ...n, [r._id]: r.title }));
                  setQ('');
                  setRes([]);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-[13px] hover:bg-ivory"
              >
                <b>{r.title}</b> <span className="text-ink/45">· {r.locality}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LocalityPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const o = useApi<{ localities: { slug: string; name: string; city: string }[]; cities: { slug: string; name: string }[] }>('options').data;
  const cityName = Object.fromEntries((o?.cities ?? []).map((c) => [c.slug, c.name]));
  const all = (o?.localities ?? []).map((l) => ({ key: `${l.city}/${l.slug}`, label: `${l.name}, ${cityName[l.city] ?? l.city}` }));
  const [pick, setPick] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((k) => (
          <span key={k} className="inline-flex items-center gap-1 rounded-lg bg-ivory-200 py-1 pl-2.5 pr-1 text-[12.5px] font-medium">
            {all.find((a) => a.key === k)?.label ?? k}
            <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((x) => x !== k))} className="grid h-5 w-5 place-items-center rounded-md hover:bg-white"><X className="h-3 w-3" /></button>
          </span>
        ))}
        {!value.length && <span className="text-[12.5px] text-ink/45">Automatic — localities marked “Popular” (or a mix across cities) are shown.</span>}
      </div>
      <div className="mt-3 flex gap-2">
        <select className="a-input" value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">Choose a locality…</option>
          {all.filter((a) => !value.includes(a.key)).map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
        </select>
        <button type="button" className="a-btn a-btn-ink" disabled={!pick} onClick={() => { onChange([...value, pick].slice(0, 12)); setPick(''); }}>Add</button>
      </div>
    </div>
  );
}

export default function ContentEditor({ id }: { id: string }) {
  const { toast } = useAdmin();
  const { data, error, reload } = useApi<{ item: any }>(`content/${encodeURIComponent(id)}`);
  const [d, setD] = useState<any>(null);
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);
  const loaded = useRef(false);
  useEffect(() => {
    if (data?.item && !loaded.current) {
      loaded.current = true;
      setD(data.item);
      setSaved(JSON.stringify(data.item));
    }
  }, [data]);
  const dirty = !!d && JSON.stringify(d) !== saved;
  useUnsaved(dirty);
  const set = (k: string, v: any) => setD((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    setBusy(true);
    try {
      const r = await api<{ item: any }>(`content/${encodeURIComponent(id)}`, { method: 'PUT', body: d });
      setD(r.item);
      setSaved(JSON.stringify(r.item));
      toast('Saved — the website updates within seconds');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not save', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorBox error={error} retry={reload} />;
  if (!d) return <Loading rows={8} />;
  const legal = id.startsWith('legal:');
  const viewHref = legal ? `/${d.slug}` : links[id];

  return (
    <div className="max-w-4xl">
      <PageHeader
        back={{ href: '/admin/content', label: 'Pages & Content' }}
        eyebrow={legal ? 'Legal page' : 'Page content'}
        title={legal ? d.title : titles[id] ?? id}
        actions={
          <>
            <a href={viewHref} target="_blank" rel="noopener" className="a-btn a-btn-ghost"><ExternalLink className="h-4 w-4" /> View</a>
            <SaveButton busy={busy} onClick={save}>{dirty ? 'Save changes' : 'Saved'}</SaveButton>
          </>
        }
      />
      <div className="space-y-5">
        {id === 'home' && (
          <>
            <Card title="Hero banner">
              <div className="grid gap-4 sm:grid-cols-2">
                <T d={d} k="eyebrow" set={set} label="Small heading" />
                <T d={d} k="accent" set={set} label="Gold italic word" hint="Shown after the title in gold." />
                <div className="sm:col-span-2"><T d={d} k="title" set={set} label="Main heading" /></div>
                <div className="sm:col-span-2"><T d={d} k="subtitle" set={set} label="Sub-heading" area rows={2} /></div>
                <Field label="Desktop banner (landscape)"><ImageField value={d.heroDesktop} onChange={(v) => set('heroDesktop', v)} folder="banners" /></Field>
                <Field label="Mobile banner (portrait)"><ImageField value={d.heroMobile} onChange={(v) => set('heroMobile', v)} folder="banners" aspect="aspect-[3/4] max-w-[220px]" /></Field>
              </div>
              <div className="mt-5">
                <p className="a-label">Popular search chips</p>
                <Repeater<{ label: string; href: string }>
                  items={d.popularChips ?? []}
                  onChange={(v) => set('popularChips', v)}
                  blank={{ label: '', href: '/city/' }}
                  addLabel="Add chip"
                  max={10}
                  render={(c, upd) => (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input className="a-input" value={c.label} onChange={(e) => upd({ label: e.target.value })} placeholder="Label e.g. Worli" />
                      <input className="a-input font-mono text-[12.5px]" value={c.href} onChange={(e) => upd({ href: e.target.value })} placeholder="/city/mumbai/worli" />
                    </div>
                  )}
                />
              </div>
              <div className="mt-5"><Lines d={d} k="trustPoints" set={set} label="Trust points under the search (desktop)" /></div>
            </Card>
            <Card title="Categories & featured">
              <div className="grid gap-4">
                <T d={d} k="categoriesTitle" set={set} label="Categories heading" />
                <T d={d} k="categoriesText" set={set} label="Categories text" area rows={2} />
                <T d={d} k="featuredTitle" set={set} label="Featured heading" />
                <T d={d} k="featuredText" set={set} label="Featured text" area rows={2} />
                <Field label="Featured listings (in order)"><FeaturedPicker value={d.featuredIds ?? []} onChange={(v) => set('featuredIds', v)} /></Field>
              </div>
            </Card>
            <Card title="Why choose us">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><T d={d} k="whyTitle" set={set} label="Heading" /></div>
                <div className="sm:col-span-2"><T d={d} k="whyText" set={set} label="Text" area rows={3} /></div>
                <T d={d} k="whyQuote" set={set} label="Quote on the image" />
                <Field label="Image"><ImageField value={d.whyImage} onChange={(v) => set('whyImage', v)} folder="banners" aspect="aspect-[4/3]" /></Field>
              </div>
              <div className="mt-5">
                <p className="a-label">Points (4 recommended)</p>
                <Repeater<{ title: string; text: string }>
                  items={d.whyItems ?? []}
                  onChange={(v) => set('whyItems', v)}
                  blank={{ title: '', text: '' }}
                  addLabel="Add point"
                  max={8}
                  render={(x, upd) => (
                    <div className="grid gap-2 sm:grid-cols-[200px_1fr]">
                      <input className="a-input font-semibold" value={x.title} onChange={(e) => upd({ title: e.target.value })} placeholder="Title" />
                      <input className="a-input" value={x.text} onChange={(e) => upd({ text: e.target.value })} placeholder="Short text" />
                    </div>
                  )}
                />
              </div>
            </Card>
            <Card title="Sell / post property banner">
              <div className="grid gap-4 sm:grid-cols-2">
                <T d={d} k="sellEyebrow" set={set} label="Small heading" />
                <T d={d} k="sellAccent" set={set} label="Gold italic word" />
                <div className="sm:col-span-2"><T d={d} k="sellTitle" set={set} label="Heading" /></div>
                <div className="sm:col-span-2"><T d={d} k="sellText" set={set} label="Text" area rows={2} /></div>
              </div>
            </Card>
            <Card title="WhatsApp shortlist section">
              <div className="grid gap-4">
                <T d={d} k="showcaseTitle" set={set} label="Heading" />
                <T d={d} k="showcaseText" set={set} label="Text" area rows={3} />
              </div>
            </Card>
            <Card title="Popular localities">
              <LocalityPicker value={d.popularLocalities ?? []} onChange={(v) => set('popularLocalities', v)} />
            </Card>
          </>
        )}

        {id === 'about' && (
          <>
            <Card title="Hero">
              <div className="grid gap-4">
                <T d={d} k="heroTitle" set={set} label="Heading" />
                <T d={d} k="heroText" set={set} label="Text" area rows={2} />
                <Field label="Background image"><ImageField value={d.heroImage} onChange={(v) => set('heroImage', v)} folder="banners" /></Field>
              </div>
            </Card>
            <Card title="Our story">
              <div className="grid gap-4">
                <T d={d} k="storyTitle" set={set} label="Heading" />
                <Paras d={d} k="story" set={set} label="Story" />
                <Field label="Image"><ImageField value={d.image} onChange={(v) => set('image', v)} folder="banners" aspect="aspect-[4/3] max-w-md" /></Field>
              </div>
            </Card>
            <Card title="Values">
              <Repeater<{ title: string; text: string }>
                items={d.values ?? []}
                onChange={(v) => set('values', v)}
                blank={{ title: '', text: '' }}
                addLabel="Add value"
                max={8}
                render={(x, upd) => (
                  <div className="grid gap-2 sm:grid-cols-[200px_1fr]">
                    <input className="a-input font-semibold" value={x.title} onChange={(e) => upd({ title: e.target.value })} placeholder="Title" />
                    <input className="a-input" value={x.text} onChange={(e) => upd({ text: e.target.value })} placeholder="Text" />
                  </div>
                )}
              />
            </Card>
            <Card title="FAQs"><Faqs d={d} set={set} /></Card>
          </>
        )}

        {id === 'contact' && (
          <>
            <Card title="Hero">
              <div className="grid gap-4">
                <T d={d} k="heroTitle" set={set} label="Heading" />
                <T d={d} k="heroText" set={set} label="Text" area rows={2} />
                <Field label="Background image"><ImageField value={d.heroImage} onChange={(v) => set('heroImage', v)} folder="banners" /></Field>
                <T d={d} k="mapQuery" set={set} label="Map location" hint="Address or place name shown on the map." />
              </div>
              <p className="mt-4 rounded-xl bg-ivory px-4 py-3 text-[12.5px] text-ink/60">Phone, WhatsApp, email, address and office hours are edited in <a href="/admin/settings" className="font-semibold text-gold-dark hover:underline">Settings → Contact</a>.</p>
            </Card>
            <Card title="FAQs"><Faqs d={d} set={set} /></Card>
          </>
        )}

        {id === 'footer' && (
          <Card title="Footer">
            <div className="grid gap-4">
              <T d={d} k="description" set={set} label="About text" area rows={3} />
              <T d={d} k="bottomNote" set={set} label="Bottom note (disclaimer line)" area rows={2} />
            </div>
            <p className="mt-4 rounded-xl bg-ivory px-4 py-3 text-[12.5px] text-ink/60">Contact details and social media links are managed in <a href="/admin/settings" className="font-semibold text-gold-dark hover:underline">Settings</a>. City links come from Locations.</p>
          </Card>
        )}

        {legal && (
          <>
            <Card title="Page">
              <T d={d} k="title" set={set} label="Title" />
            </Card>
            <Card title="Sections">
              <Repeater<{ h: string; p: string[] }>
                items={d.sections ?? []}
                onChange={(v) => set('sections', v)}
                blank={{ h: '', p: [] }}
                addLabel="Add section"
                render={(x, upd) => (
                  <div className="grid gap-2">
                    <input className="a-input font-semibold" value={x.h} onChange={(e) => upd({ h: e.target.value })} placeholder="Heading" />
                    <textarea className="a-input min-h-[140px] leading-relaxed" value={(x.p ?? []).join('\n\n')} onChange={(e) => upd({ p: e.target.value.split(/\n{2,}/) })} placeholder="Text — empty line between paragraphs" />
                  </div>
                )}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
