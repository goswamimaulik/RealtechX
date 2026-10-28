'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck, Building2, CheckCircle2, Circle, ExternalLink, Eye, FileText, Globe, ImageIcon, IndianRupee, LayoutGrid, ListChecks, MapPin, Phone, Sparkles, Trash2,
} from 'lucide-react';
import { api, inr, when } from './api';
import { Badge, Counter, ErrorBox, Field, Loading, PageHeader, Repeater, SaveButton, TagInput, Toggle, publishTone, useAdmin, useApi, useUnsaved } from './ui';
import { ImageField, ImagesField } from './media';

type Opt = { slug: string; label: string; parent?: string };
type Options = {
  cities: { slug: string; name: string; state: string }[];
  localities: { slug: string; name: string; city: string }[];
  developers: { slug: string; name: string }[];
  purposes: Opt[];
  categories: Opt[];
  subtypes: Opt[];
  amenities: Opt[];
  furnishing: Opt[];
  statuses: Opt[];
  site: { url: string; name: string };
};

type Config = { label: string; area: string; price: string; image?: string };
type Near = { name: string; distance: string };
type Seo = { title?: string; description?: string; keywords?: string; ogImage?: string; canonical?: string; noindex?: boolean };

interface Form {
  _id?: string;
  id?: string;
  title: string;
  tagline: string;
  slug: string;
  kind: 'project' | 'property';
  publish: 'published' | 'draft' | 'pending';
  purpose: 'buy' | 'rent' | 'lease';
  type: string;
  subType: string;
  status: string;
  source: 'published' | 'sample';
  featured: boolean;
  city: string;
  locality: string;
  address: string;
  mapQuery: string;
  lat: string;
  lng: string;
  nearby: Near[];
  developer: string;
  rera: string;
  reraQr: string;
  possession: string;
  landParcel: string;
  totalUnits: string;
  priceMin: string;
  priceMax: string;
  areaMin: string;
  areaMax: string;
  areaUnit: 'sq.ft' | 'sq.yd' | 'acre';
  furnishing: string;
  configurations: Config[];
  images: string[];
  videoUrl: string;
  brochureUrl: string;
  amenities: string[];
  highlights: string;
  description: string;
  contactPhone: string;
  whatsapp: string;
  seo: Seo;
  updatedAt?: string;
  updatedBy?: string;
  views?: number;
}

const blank = (kind: 'project' | 'property'): Form => ({
  title: '', tagline: '', slug: '', kind, publish: 'draft', purpose: 'buy', type: 'residential', subType: '', status: kind === 'project' ? 'under-construction' : 'ready-to-move',
  source: 'published', featured: false, city: '', locality: '', address: '', mapQuery: '', lat: '', lng: '', nearby: [], developer: '', rera: '', reraQr: '', possession: '',
  landParcel: '', totalUnits: '', priceMin: '', priceMax: '', areaMin: '', areaMax: '', areaUnit: 'sq.ft', furnishing: '', configurations: [], images: [], videoUrl: '',
  brochureUrl: '', amenities: [], highlights: '', description: '', contactPhone: '', whatsapp: '', seo: {},
});

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromDoc(d: any): Form {
  const s = (v: any) => (v === undefined || v === null || v === 0 ? '' : String(v));
  return {
    ...blank(d.kind === 'property' ? 'property' : 'project'),
    _id: d._id, id: d.id, title: d.title ?? '', tagline: d.tagline ?? '', slug: d.slug ?? '', kind: d.kind === 'property' ? 'property' : 'project',
    publish: d.publish ?? 'published', purpose: d.purpose ?? d.listingFor ?? 'buy', type: d.type ?? 'residential', subType: d.subType ?? '', status: d.status ?? '',
    source: d.source === 'sample' ? 'sample' : 'published', featured: !!d.featured, city: d.city ?? '', locality: d.locality ?? '', address: d.address ?? '', mapQuery: d.mapQuery ?? '',
    lat: s(d.lat), lng: s(d.lng), nearby: d.nearby ?? [], developer: d.developer ?? '', rera: d.rera ?? '', reraQr: d.reraQr ?? '', possession: d.possession ?? '',
    landParcel: d.landParcel ?? '', totalUnits: d.totalUnits ?? '', priceMin: s(d.priceMin), priceMax: s(d.priceMax), areaMin: s(d.areaMin), areaMax: s(d.areaMax),
    areaUnit: d.areaUnit ?? 'sq.ft', furnishing: d.furnishing ?? '', configurations: d.configurations ?? [], images: d.images ?? [], videoUrl: d.videoUrl ?? '',
    brochureUrl: d.brochureUrl ?? '', amenities: d.amenities ?? [], highlights: (d.highlights ?? []).join('\n'), description: (d.description ?? []).join('\n\n'),
    contactPhone: d.contactPhone ?? '', whatsapp: d.whatsapp ?? '', seo: d.seo ?? {}, updatedAt: d.updatedAt, updatedBy: d.updatedBy, views: d.views,
  };
}

const toBody = (f: Form) => ({
  ...f,
  priceMin: Number(f.priceMin) || 0,
  priceMax: Number(f.priceMax) || 0,
  areaMin: Number(f.areaMin) || 0,
  areaMax: Number(f.areaMax) || 0,
  lat: f.lat,
  lng: f.lng,
  highlights: f.highlights.split('\n').map((x) => x.trim()).filter(Boolean),
  description: f.description,
});

const sections = [
  { id: 'basics', label: 'Basics', icon: Sparkles },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'developer', label: 'Developer & RERA', icon: Building2 },
  { id: 'pricing', label: 'Price & area', icon: IndianRupee },
  { id: 'plans', label: 'Configurations', icon: LayoutGrid },
  { id: 'media', label: 'Photos & media', icon: ImageIcon },
  { id: 'amenities', label: 'Amenities', icon: ListChecks },
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'seo', label: 'SEO', icon: Globe },
];

function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="a-card scroll-mt-24 p-5 md:p-6">
      <div className="mb-5">
        <h2 className="font-display text-[23px] font-semibold leading-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-ink/50">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

export default function PropertyEditor({ id: initialId, initialKind = 'project' }: { id: string | null; initialKind?: 'project' | 'property' }) {
  const [id, setId] = useState<string | null>(initialId);
  const router = useRouter();
  const { toast, confirm } = useAdmin();
  const { data: opts } = useApi<Options>('options');
  const doc = useApi<{ item: any }>(initialId ? `properties/${encodeURIComponent(initialId)}` : null);
  const [f, setF] = useState<Form>(() => blank(initialKind));
  const [saved, setSaved] = useState<string>(JSON.stringify(blank(initialKind)));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [active, setActive] = useState('basics');
  const loadedRef = useRef(false);

  useEffect(() => {
    if (doc.data?.item && !loadedRef.current) {
      loadedRef.current = true;
      const v = fromDoc(doc.data.item);
      setF(v);
      setSaved(JSON.stringify(v));
      setSlugTouched(true);
    }
  }, [doc.data]);

  const dirty = JSON.stringify(f) !== saved;
  useUnsaved(dirty);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  // scroll-spy for the section nav
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) setActive(vis.target.id);
    }, { rootMargin: '-90px 0px -60% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [doc.loading]);

  const cityLocalities = useMemo(() => (opts?.localities ?? []).filter((l) => l.city === f.city), [opts, f.city]);
  const subtypes = useMemo(() => (opts?.subtypes ?? []).filter((s) => !s.parent || s.parent === f.type), [opts, f.type]);
  const cityName = opts?.cities.find((c) => c.slug === f.city)?.name ?? '';
  const isRent = f.purpose !== 'buy';
  const slugPreview = slugTouched ? f.slug : slugify(`${f.title} ${f.locality}`);

  const checks = [
    { ok: !!f.title && !!f.city && !!f.locality, t: 'Title, city & locality' },
    { ok: f.images.length >= 3, t: 'At least 3 photos' },
    { ok: Number(f.priceMin) > 0, t: 'Starting price' },
    { ok: f.configurations.length > 0, t: 'Configurations / floor plans' },
    { ok: f.amenities.length >= 4, t: '4+ amenities' },
    { ok: f.description.length >= 200, t: 'Description (200+ characters)' },
    { ok: f.nearby.length > 0, t: 'Nearby places' },
    { ok: !!f.seo.description || f.description.length >= 120, t: 'Meta description' },
  ];
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  const save = async (publish?: Form['publish']) => {
    setErr('');
    const body = toBody({ ...f, slug: slugTouched ? f.slug : '', publish: publish ?? f.publish });
    setBusy(true);
    try {
      const r = id ? await api<{ item: any }>(`properties/${encodeURIComponent(id)}`, { method: 'PUT', body }) : await api<{ item: any }>('properties', { body });
      const v = fromDoc(r.item);
      setF(v);
      setSaved(JSON.stringify(v));
      setSlugTouched(true);
      toast(publish === 'published' ? 'Published — live on the website' : 'Saved');
      if (!id) {
        setId(r.item._id);
        loadedRef.current = true;
        router.replace(`/admin/properties/${r.item._id}`);
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Could not save';
      setErr(m);
      toast(m, 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    if (!(await confirm({ title: `Delete “${f.title}”?`, text: 'This listing and its page will be removed permanently.', confirm: 'Delete', danger: true }))) return;
    try {
      await api(`properties/${encodeURIComponent(id)}`, { method: 'DELETE' });
      setSaved(JSON.stringify(f));
      toast('Listing deleted');
      router.push(f.kind === 'project' ? '/admin/projects' : '/admin/properties');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  if (id && doc.error) return <ErrorBox error={doc.error} retry={doc.reload} />;
  if ((id && doc.loading && !loadedRef.current) || !opts) return <Loading rows={8} />;

  const backHref = f.kind === 'project' ? '/admin/projects' : '/admin/properties';

  return (
    <div>
      <PageHeader
        back={{ href: backHref, label: f.kind === 'project' ? 'Projects' : 'Properties' }}
        eyebrow={id ? `${f.id ?? ''} · ${f.kind === 'project' ? 'Project' : 'Property'}` : `New ${f.kind}`}
        title={f.title || (f.kind === 'project' ? 'Add a new project' : 'Add a new property')}
        subtitle={id ? <span className="inline-flex flex-wrap items-center gap-2"><Badge tone={publishTone(f.publish)}>{f.publish}</Badge>Last updated {when(f.updatedAt)}{f.updatedBy ? ` by ${f.updatedBy}` : ''} · <Eye className="h-3.5 w-3.5" /> {f.views ?? 0} views</span> : 'Fill in the details exactly as they should appear on the property page. Everything except the title, city and locality can be added later.'}
        actions={
          <>
            {id && f.publish === 'published' && <a href={`/property/${f.slug}`} target="_blank" rel="noopener" className="a-btn a-btn-ghost"><ExternalLink className="h-4 w-4" /> View page</a>}
            <SaveButton busy={busy} onClick={() => save()} className="hidden md:inline-flex">{f.publish === 'published' ? 'Save & update' : 'Save draft'}</SaveButton>
            {f.publish !== 'published' && <button disabled={busy} onClick={() => save('published')} className="a-btn a-btn-ink hidden md:inline-flex"><BadgeCheck className="h-4 w-4" /> Publish</button>}
          </>
        }
      />
      {err && <div className="mb-4"><ErrorBox error={err} /></div>}

      <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_300px]">
        {/* Section nav */}
        <nav className="hidden lg:block">
          <ul className="sticky top-24 space-y-0.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition ${active === s.id ? 'bg-white text-ink shadow-card' : 'text-ink/55 hover:text-ink'}`}>
                  <s.icon className={`h-4 w-4 ${active === s.id ? 'text-gold-dark' : ''}`} /> {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-5">
          <Section id="basics" title="Basics" subtitle="What is it, and how should it be listed?">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Listing kind" hint="Projects appear under Admin → Projects; properties are resale / rental units.">
                <div className="grid grid-cols-2 gap-2">
                  {(['project', 'property'] as const).map((k) => (
                    <button key={k} type="button" onClick={() => set('kind', k)} className={`rounded-xl border px-3 py-2.5 text-[13px] font-semibold capitalize transition ${f.kind === k ? 'border-ink bg-ink text-ivory' : 'border-ink/10 bg-white hover:border-gold/50'}`}>{k === 'project' ? 'Builder project' : 'Property / unit'}</button>
                  ))}
                </div>
              </Field>
              <Field label="Purpose">
                <div className="grid grid-cols-3 gap-2">
                  {(opts.purposes.length ? opts.purposes : [{ slug: 'buy', label: 'Buy' }, { slug: 'rent', label: 'Rent' }, { slug: 'lease', label: 'Lease' }]).map((p) => (
                    <button key={p.slug} type="button" onClick={() => set('purpose', p.slug as Form['purpose'])} className={`rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition ${f.purpose === p.slug ? 'border-ink bg-ink text-ivory' : 'border-ink/10 bg-white hover:border-gold/50'}`}>{p.slug === 'buy' ? 'Sale' : p.label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Title" required className="md:col-span-2">
                <input className="a-input" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Lodha Park Sky Residences" maxLength={140} />
              </Field>
              <Field label="Tagline" className="md:col-span-2" hint="One line shown under the title and on cards.">
                <input className="a-input" value={f.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="e.g. Sea-facing 3 & 4 BHK residences in Worli" maxLength={200} />
              </Field>
              <Field label="Category" required>
                <select className="a-input" value={f.type} onChange={(e) => { set('type', e.target.value); set('subType', ''); }}>
                  {opts.categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Property type">
                <select className="a-input" value={f.subType} onChange={(e) => set('subType', e.target.value)}>
                  <option value="">—</option>
                  {subtypes.map((s) => <option key={s.slug} value={s.label}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Project status">
                <select className="a-input" value={f.status} onChange={(e) => set('status', e.target.value)}>
                  {opts.statuses.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Data source" hint="Shown as a badge + disclaimer on the page.">
                <select className="a-input" value={f.source} onChange={(e) => set('source', e.target.value as Form['source'])}>
                  <option value="published">Details as published by developer</option>
                  <option value="sample">Sample / demo listing</option>
                </select>
              </Field>
              <Field label="URL slug" className="md:col-span-2" hint={<>Page address: <span className="font-mono text-ink/60">/property/{slugPreview || '…'}</span></>}>
                <input className="a-input font-mono" value={slugTouched ? f.slug : slugPreview} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} placeholder="auto from title" />
              </Field>
              <div className="md:col-span-2">
                <Toggle checked={f.featured} onChange={(v) => set('featured', v)} label="Featured listing" hint="Shown in “Featured projects” on the home page (unless you pick featured items manually in Pages & Content)." />
              </div>
            </div>
          </Section>

          <Section id="location" title="Location" subtitle="Where is it? Powers city & locality pages, maps and filters.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="City" required hint={opts.cities.length ? undefined : 'Add a city under Locations first.'}>
                <select className="a-input" value={f.city} onChange={(e) => set('city', e.target.value)}>
                  <option value="">Select city</option>
                  {opts.cities.map((c) => <option key={c.slug} value={c.slug}>{c.name} — {c.state}</option>)}
                </select>
              </Field>
              <Field label="Locality" required hint="Pick one or type a new locality — it’s added to Locations automatically.">
                <input className="a-input" list="rtx-localities" value={f.locality} onChange={(e) => set('locality', e.target.value)} placeholder={f.city ? 'e.g. Baner' : 'Choose a city first'} disabled={!f.city} />
                <datalist id="rtx-localities">{cityLocalities.map((l) => <option key={l.slug} value={l.name} />)}</datalist>
              </Field>
              <Field label="Full address" className="md:col-span-2">
                <input className="a-input" value={f.address} onChange={(e) => set('address', e.target.value)} placeholder="Plot / street, landmark, PIN" />
              </Field>
              <Field label="Google Maps search text" hint="Used for the embedded map when latitude/longitude are empty.">
                <input className="a-input" value={f.mapQuery} onChange={(e) => set('mapQuery', e.target.value)} placeholder={f.title && f.locality ? `${f.title}, ${f.locality}, ${cityName}` : 'Project name, locality, city'} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude"><input className="a-input" inputMode="decimal" value={f.lat} onChange={(e) => set('lat', e.target.value)} placeholder="19.0176" /></Field>
                <Field label="Longitude"><input className="a-input" inputMode="decimal" value={f.lng} onChange={(e) => set('lng', e.target.value)} placeholder="72.8562" /></Field>
              </div>
            </div>
            <div className="mt-5">
              <p className="a-label">Nearby places (location advantages)</p>
              <Repeater<Near>
                items={f.nearby}
                onChange={(v) => set('nearby', v)}
                blank={{ name: '', distance: '' }}
                addLabel="Add nearby place"
                render={(n, upd) => (
                  <div className="grid gap-2 sm:grid-cols-[1fr_160px]">
                    <input className="a-input" value={n.name} onChange={(e) => upd({ name: e.target.value })} placeholder="e.g. Phoenix Mall / Metro station / Airport" />
                    <input className="a-input" value={n.distance} onChange={(e) => upd({ distance: e.target.value })} placeholder="e.g. 5 min · 2 km" />
                  </div>
                )}
              />
            </div>
          </Section>

          <Section id="developer" title="Developer & RERA">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Developer / builder" hint={<Link href="/admin/developers" className="text-gold-dark hover:underline">Manage developers →</Link>}>
                <select className="a-input" value={f.developer} onChange={(e) => set('developer', e.target.value)}>
                  <option value="">— None (individual owner) —</option>
                  {opts.developers.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
                </select>
              </Field>
              <Field label="RERA registration no."><input className="a-input" value={f.rera} onChange={(e) => set('rera', e.target.value)} placeholder="e.g. P51800012345" /></Field>
              <Field label="Possession"><input className="a-input" value={f.possession} onChange={(e) => set('possession', e.target.value)} placeholder="e.g. Dec 2027 / Ready" /></Field>
              <Field label="Land parcel"><input className="a-input" value={f.landParcel} onChange={(e) => set('landParcel', e.target.value)} placeholder="e.g. 4.5 acres" /></Field>
              <Field label="Total units / towers"><input className="a-input" value={f.totalUnits} onChange={(e) => set('totalUnits', e.target.value)} placeholder="e.g. 420 units · 3 towers" /></Field>
              <Field label="RERA QR code"><ImageField value={f.reraQr} onChange={(v) => set('reraQr', v)} folder="properties" aspect="aspect-square max-w-[160px]" contain /></Field>
            </div>
          </Section>

          <Section id="pricing" title="Price & area" subtitle={isRent ? 'Monthly rent in ₹.' : 'Total price in ₹ (leave 0 for “Price on request”).'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={isRent ? 'Rent from (₹ / month)' : 'Price from (₹)'} hint={inr(Number(f.priceMin))}>
                <input className="a-input tabular-nums" inputMode="numeric" value={f.priceMin} onChange={(e) => set('priceMin', e.target.value.replace(/[^\d]/g, ''))} placeholder={isRent ? '85000' : '25000000'} />
              </Field>
              <Field label={isRent ? 'Rent up to (₹ / month)' : 'Price up to (₹)'} hint={Number(f.priceMax) ? inr(Number(f.priceMax)) : 'Leave empty for “onwards”'}>
                <input className="a-input tabular-nums" inputMode="numeric" value={f.priceMax} onChange={(e) => set('priceMax', e.target.value.replace(/[^\d]/g, ''))} />
              </Field>
              <Field label="Area from"><input className="a-input tabular-nums" inputMode="decimal" value={f.areaMin} onChange={(e) => set('areaMin', e.target.value.replace(/[^\d.]/g, ''))} placeholder="1250" /></Field>
              <div className="grid grid-cols-[1fr_120px] gap-2">
                <Field label="Area up to"><input className="a-input tabular-nums" inputMode="decimal" value={f.areaMax} onChange={(e) => set('areaMax', e.target.value.replace(/[^\d.]/g, ''))} placeholder="2400" /></Field>
                <Field label="Unit">
                  <select className="a-input" value={f.areaUnit} onChange={(e) => set('areaUnit', e.target.value as Form['areaUnit'])}>
                    <option value="sq.ft">sq.ft</option><option value="sq.yd">sq.yd</option><option value="acre">acre</option>
                  </select>
                </Field>
              </div>
              <Field label="Furnishing">
                <select className="a-input" value={f.furnishing} onChange={(e) => set('furnishing', e.target.value)}>
                  <option value="">—</option>
                  {opts.furnishing.map((x) => <option key={x.slug} value={x.label}>{x.label}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          <Section id="plans" title="Configurations & floor plans" subtitle="Each row becomes a tab in “Floor plans & pricing”. BHK filters are detected from labels like “3 BHK”.">
            <Repeater<Config>
              items={f.configurations}
              onChange={(v) => set('configurations', v)}
              blank={{ label: '', area: '', price: '' }}
              addLabel="Add configuration"
              render={(c, upd) => (
                <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Field label="Label"><input className="a-input" value={c.label} onChange={(e) => upd({ label: e.target.value })} placeholder="3 BHK" /></Field>
                    <Field label="Carpet area"><input className="a-input" value={c.area} onChange={(e) => upd({ area: e.target.value })} placeholder="1,250 sq.ft" /></Field>
                    <Field label="Price"><input className="a-input" value={c.price} onChange={(e) => upd({ price: e.target.value })} placeholder="₹2.4 Cr onwards" /></Field>
                  </div>
                  <Field label="Floor plan"><ImageField value={c.image ?? ''} onChange={(v) => upd({ image: v })} folder="floor-plans" aspect="aspect-[4/3]" contain /></Field>
                </div>
              )}
            />
          </Section>

          <Section id="media" title="Photos & media" subtitle="The first photo is the cover on cards and the page. Drag order with the arrows.">
            <ImagesField value={f.images} onChange={(v) => set('images', v)} folder="properties" />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Walkthrough video (YouTube / Vimeo link)"><input className="a-input" value={f.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://youtu.be/…" /></Field>
              <Field label="Brochure (PDF)" hint="Visitors get it after submitting the enquiry form."><ImageField value={f.brochureUrl} onChange={(v) => set('brochureUrl', v)} folder="brochures" kind="any" /></Field>
            </div>
          </Section>

          <Section id="amenities" title="Amenities & highlights">
            <Field label="Amenities"><TagInput value={f.amenities} onChange={(v) => set('amenities', v)} suggestions={opts.amenities.map((a) => a.label)} placeholder="Swimming Pool, Clubhouse…" /></Field>
            <Field label="Key highlights" hint="One per line — shown as ticked points in the overview." className="mt-5">
              <textarea className="a-input min-h-[120px]" value={f.highlights} onChange={(e) => set('highlights', e.target.value)} placeholder={'Sea-facing living rooms\n5 min from BKC\nIGBC Gold pre-certified'} />
            </Field>
          </Section>

          <Section id="description" title="Description" subtitle="Leave an empty line between paragraphs.">
            <textarea className="a-input min-h-[220px] leading-relaxed" value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the project, the location advantages, design and lifestyle…" />
            <p className="mt-1.5 text-right text-[11.5px] text-ink/45">{f.description.length} characters</p>
          </Section>

          <Section id="contact" title="Listing contact" subtitle="Calls & WhatsApp on this page go here. Leave empty to use the website number from Settings.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Call number"><input className="a-input" inputMode="tel" value={f.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} placeholder="+91 98765 43210" /></Field>
              <Field label="WhatsApp number"><input className="a-input" inputMode="tel" value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="919876543210" /></Field>
            </div>
          </Section>

          <Section id="seo" title="SEO" subtitle="Optional — sensible titles and descriptions are generated automatically.">
            <div className="mb-5 rounded-2xl border border-ink/[0.07] bg-ivory/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">Google preview</p>
              <p className="mt-2 truncate text-[12.5px] text-emerald-800">{(opts.site.url || 'https://your-site.com').replace(/\/$/, '')}/property/{slugPreview}</p>
              <p className="truncate text-[18px] leading-snug text-[#1a0dab]">{f.seo.title || `${f.title || 'Property title'}, ${f.locality} ${cityName}`}</p>
              <p className="line-clamp-2 text-[13px] text-ink/65">{f.seo.description || f.tagline || f.description.slice(0, 160) || 'Meta description…'}</p>
            </div>
            <div className="grid gap-4">
              <Field label={<span className="flex justify-between">Meta title <Counter value={f.seo.title ?? ''} ideal={[30, 65]} /></span>}>
                <input className="a-input" value={f.seo.title ?? ''} onChange={(e) => set('seo', { ...f.seo, title: e.target.value })} placeholder="Leave empty for automatic" />
              </Field>
              <Field label={<span className="flex justify-between">Meta description <Counter value={f.seo.description ?? ''} ideal={[70, 165]} /></span>}>
                <textarea className="a-input min-h-[80px]" value={f.seo.description ?? ''} onChange={(e) => set('seo', { ...f.seo, description: e.target.value })} />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Keywords" hint="Comma separated"><input className="a-input" value={f.seo.keywords ?? ''} onChange={(e) => set('seo', { ...f.seo, keywords: e.target.value })} /></Field>
                <Field label="Canonical URL" hint="Only if this content lives elsewhere"><input className="a-input" value={f.seo.canonical ?? ''} onChange={(e) => set('seo', { ...f.seo, canonical: e.target.value })} /></Field>
              </div>
              <Field label="Social share image" hint="Defaults to the cover photo"><ImageField value={f.seo.ogImage ?? ''} onChange={(v) => set('seo', { ...f.seo, ogImage: v })} folder="properties" aspect="aspect-[1200/630] max-w-sm" /></Field>
              <Toggle checked={!!f.seo.noindex} onChange={(v) => set('seo', { ...f.seo, noindex: v })} label="Hide from Google (noindex)" hint="The page stays visible to visitors but search engines won’t list it." />
            </div>
          </Section>

          {id && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
              <div>
                <p className="font-semibold text-rose-800">Delete this listing</p>
                <p className="text-[12.5px] text-rose-700/80">Removes the page from the website permanently.</p>
              </div>
              <button onClick={remove} className="a-btn a-btn-danger"><Trash2 className="h-4 w-4" /> Delete</button>
            </div>
          )}
        </div>

        {/* Right rail */}
        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-4">
            <div className="a-card p-5">
              <p className="a-label">Visibility</p>
              <select className="a-input" value={f.publish} onChange={(e) => set('publish', e.target.value as Form['publish'])}>
                <option value="draft">Draft — hidden</option>
                <option value="pending">Pending review — hidden</option>
                <option value="published">Published — live</option>
              </select>
              <SaveButton busy={busy} onClick={() => save()} className="mt-3 w-full">{dirty ? 'Save changes' : 'Saved'}</SaveButton>
              {f.publish !== 'published' && <button disabled={busy} onClick={() => save('published')} className="a-btn a-btn-ink mt-2 w-full"><BadgeCheck className="h-4 w-4" /> Save & publish</button>}
              {dirty && <p className="mt-2 text-center text-[11.5px] text-amber-700">You have unsaved changes</p>}
            </div>
            <div className="a-card p-5">
              <div className="flex items-center justify-between">
                <p className="a-label !mb-0">Listing quality</p>
                <span className={`font-display text-[22px] font-semibold ${score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{score}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.06]"><div className="h-full rounded-full bg-gold-grad transition-all" style={{ width: `${score}%` }} /></div>
              <ul className="mt-4 space-y-2">
                {checks.map((c) => (
                  <li key={c.t} className={`flex items-center gap-2 text-[12.5px] ${c.ok ? 'text-ink/70' : 'text-ink/45'}`}>
                    {c.ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 shrink-0 text-ink/25" />}
                    {c.t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur xl:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <select className="a-input !w-auto flex-1" value={f.publish} onChange={(e) => set('publish', e.target.value as Form['publish'])} aria-label="Visibility">
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
        </select>
        <SaveButton busy={busy} onClick={() => save()} className="flex-1">{dirty ? 'Save' : 'Saved'}</SaveButton>
      </div>
      <div className="h-16 xl:hidden" />
    </div>
  );
}
