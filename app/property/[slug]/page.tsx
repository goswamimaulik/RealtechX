import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight, BadgeCheck, Building, CalendarCheck, CalendarClock, CheckCircle2, Download, ExternalLink, FileText, Layers, MapPin, Maximize2, MessageCircle, Phone, QrCode, ShieldCheck, Sparkles,
} from 'lucide-react';
import Gallery from '@/components/Gallery';
import PropertyActions from '@/components/PropertyActions';
import PropertyCard from '@/components/PropertyCard';
import LeadForm from '@/components/LeadForm';
import EmiCalculator from '@/components/EmiCalculator';
import Carousel from '@/components/Carousel';
import LocationTabs from '@/components/LocationTabs';
import { AutoLeadPopup, LeadButton } from '@/components/LeadButtons';
import { Breadcrumbs, Faq } from '@/components/ui';
import { getProperty, properties, localitiesOf } from '@/lib/data/properties';
import { getCity } from '@/lib/data/cities';
import { getDeveloper } from '@/lib/data/developers';
import { areaRange, configLabel, formatDate, priceRange, startPrice, titleCase } from '@/lib/format';
import { site, reraPortals } from '@/lib/site';

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) return {};
  const city = getCity(p.city)?.name;
  const title = `${p.title}, ${p.locality} ${city} — ${configLabel(p)} | ${priceRange(p)}`;
  return {
    title,
    description: `${p.tagline}. ${p.description[0].slice(0, 120)}…`,
    alternates: { canonical: `/property/${p.slug}` },
    openGraph: { title, images: [{ url: p.images[0] }] },
  };
}

const statusTone: Record<string, string> = {
  'new-launch': 'bg-gold text-ink',
  'under-construction': 'bg-ink text-gold-light',
  'ready-to-move': 'bg-emerald-500 text-white',
};

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) notFound();
  const city = getCity(p.city)!;
  const dev = getDeveloper(p.developer)!;
  const portal = reraPortals[city.state];
  const isRent = p.listingFor === 'rent';
  const devCount = properties.filter((x) => x.developer === dev.slug).length;
  const similar = properties
    .filter((x) => x.id !== p.id)
    .map((x) => ({ x, score: (x.city === p.city ? 2 : 0) + (x.type === p.type ? 2 : 0) + (x.listingFor === p.listingFor ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((s) => s.x);
  const nearbyLocalities = localitiesOf(p.city).filter((l) => l.slug !== p.localitySlug);
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi, I am interested in ${p.title} (${p.id}), ${p.locality}.`)}`;

  const keyFacts = [
    { k: 'Configuration', v: configLabel(p) },
    { k: 'Area', v: areaRange(p) },
    { k: isRent ? 'Monthly rent' : 'Price range', v: priceRange(p) },
    { k: 'Starting price', v: startPrice(p) },
    { k: 'Possession', v: p.possession },
    { k: 'Status', v: titleCase(p.status) },
    { k: 'Locality', v: `${p.locality}, ${city.name}` },
    { k: 'Developer', v: dev.name },
    { k: 'Land parcel', v: p.landParcel },
    { k: 'Total units', v: p.totalUnits },
    { k: 'RERA ID', v: p.rera },
    { k: 'Listing ID', v: p.id },
  ];

  const faqs = [
    { q: `What is the price of ${p.title}?`, a: `${p.title} in ${p.locality}, ${city.name} is priced at ${priceRange(p)} depending on configuration, floor and view.` },
    { q: `Which configurations are available in ${p.title}?`, a: `${p.title} offers ${p.configurations.map((c) => `${c.label} (${c.area})`).join(', ')}.` },
    { q: `Who is the developer of ${p.title}?`, a: `${p.title} is developed by ${dev.name}, established in ${dev.established}.` },
    { q: `What is the possession date of ${p.title}?`, a: `The possession timeline for ${p.title} is ${p.possession}.` },
    { q: `Is ${p.title} RERA registered?`, a: `This is a preview listing and its RERA registration has not been verified yet. Always check the project on ${portal?.name ?? 'the state RERA'} portal before booking.` },
  ];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.description.join(' '),
    image: p.images,
    brand: { '@type': 'Organization', name: dev.name },
    offers: { '@type': 'AggregateOffer', priceCurrency: 'INR', lowPrice: p.priceMin, highPrice: p.priceMax, offerCount: p.configurations.length, availability: 'https://schema.org/InStock' },
  };

  const tabs = ['Overview', 'Floor plans', 'Amenities', 'Location', 'Developer', 'RERA', isRent ? '' : 'EMI', 'FAQs'].filter(Boolean);
  const anchor = (t: string) => t.toLowerCase().replace(/\s+/g, '-');

  return (
    <>
      <AutoLeadPopup storageKey={p.id} property={p.title} intent="Get Best Price" image={p.images[0]} title={`Get the best price for ${p.title}`} subtitle="Price sheet, floor plans & current offers on WhatsApp in under 2 minutes." />

      {/* ───────── Gallery ───────── */}
      <div className="container pt-0 md:pt-6">
        <div className="hidden text-ink md:block md:pb-4">
          <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: `/city/${city.slug}`, label: city.name }, { href: `/city/${city.slug}/${p.localitySlug}`, label: p.locality }, { label: p.title }]} />
        </div>
        <Gallery images={p.images} title={p.title} />
      </div>

      <div className="container grid gap-10 pb-28 lg:grid-cols-[minmax(0,1fr)_370px] lg:pb-20">
        <div className="min-w-0">
          {/* ───────── Title block ───────── */}
          <div className="relative -mx-4 -mt-5 rounded-t-[26px] bg-ivory px-4 pt-5 md:mx-0 md:mt-0 md:rounded-none md:px-0 md:pt-8">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${statusTone[p.status]}`}>{titleCase(p.status)}</span>
              <span className="rounded-full bg-gold-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-dark">{titleCase(p.type)} · For {isRent ? 'rent' : 'sale'}</span>
              {p.featured && <span className="rounded-full border border-gold/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-dark">Featured</span>}
            </div>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <h1 className="font-display text-[28px] font-semibold leading-[1.1] md:text-[44px]">{p.title}</h1>
                <p className="mt-1.5 text-[14px] text-ink/70 md:text-base">{p.tagline}</p>
                <p className="mt-2 flex items-start gap-1.5 text-[13px] text-ink/70">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                  <span>{p.locality}, {city.name}, {city.state} · <a href="#location" className="font-semibold text-ink underline decoration-gold underline-offset-4">View on map</a></span>
                </p>
                <p className="mt-1 text-[13px] text-muted">by <Link href={`/developers/${dev.slug}`} className="font-semibold text-ink underline decoration-gold underline-offset-4">{dev.name}</Link></p>
              </div>
              <div className="shrink-0 md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">{isRent ? 'Rent' : 'Price'}</p>
                <p className="font-display text-[28px] font-bold leading-tight md:text-[36px]">{priceRange(p)}</p>
                <p className="text-xs text-muted">{isRent ? 'Per month · maintenance extra' : 'All-inclusive price on request'}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 md:mt-7 md:gap-3">
              {[
                { Icon: Building, k: 'Configuration', v: configLabel(p) },
                { Icon: Maximize2, k: 'Area', v: areaRange(p) },
                { Icon: CalendarClock, k: 'Possession', v: p.possession },
                { Icon: Layers, k: 'Units', v: p.totalUnits },
              ].map(({ Icon, k, v }) => (
                <div key={k} className="rounded-2xl border border-ink/[0.06] bg-white p-3 md:p-4">
                  <Icon className="h-4 w-4 text-gold-dark md:h-5 md:w-5" />
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted">{k}</p>
                  <p className="mt-0.5 text-[13px] font-bold leading-snug md:text-sm">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 md:mt-5">
              <PropertyActions id={p.id} title={p.title} />
              <LeadButton className="btn-outline !px-4 !py-2.5" property={p.title} intent="Download Brochure" source="Brochure" image={p.images[1]}>
                <Download className="h-4 w-4" /> Brochure
              </LeadButton>
            </div>
          </div>

          {/* ───────── Section nav ───────── */}
          <nav className="no-scrollbar sticky top-16 z-20 -mx-4 mt-6 flex gap-1 overflow-x-auto border-y border-ink/5 bg-ivory/95 px-4 py-2 backdrop-blur md:top-[76px] md:mx-0 md:mt-8 md:rounded-full md:border md:bg-white/95 md:px-2 md:shadow-card">
            {tabs.map((t) => (
              <a key={t} href={`#${anchor(t)}`} className="shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold text-ink/70 transition hover:bg-ink hover:text-ivory">{t}</a>
            ))}
          </nav>

          {/* ───────── Overview + key facts ───────── */}
          <Section id="overview" eyebrow="Overview" title={`About ${p.title}`}>
            <div className="rounded-2xl border border-ink/[0.06] bg-white shadow-card">
              <dl className="grid grid-cols-1 divide-y divide-ink/5 sm:grid-cols-2 sm:divide-y-0">
                {keyFacts.map((f, i) => (
                  <div key={f.k} className={`flex items-center justify-between gap-4 px-4 py-3 text-[13.5px] md:px-6 ${i % 2 === 0 ? 'sm:border-r sm:border-ink/5' : ''} ${i >= 2 ? 'sm:border-t sm:border-ink/5' : ''}`}>
                    <dt className="text-muted">{f.k}</dt>
                    <dd className="text-right font-bold">{f.v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-2 border-t border-ink/5 p-4 sm:flex-row md:px-6">
                {portal && (
                  <a href={portal.url} target="_blank" rel="noopener" className="btn-outline !py-2.5 text-[13px]">
                    <ShieldCheck className="h-4 w-4 text-gold-dark" /> Check RERA status <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <LeadButton className="btn-ink !py-2.5 text-[13px]" property={p.title} intent="Download Brochure" source="Key Facts Brochure" image={p.images[2]}>
                  <Download className="h-4 w-4" /> Download brochure
                </LeadButton>
              </div>
            </div>

            <div className="prose-luxe mt-7">
              {p.description.map((d, i) => <p key={i}>{d}</p>)}
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {p.highlights.map((h) => (
                <p key={h} className="flex items-start gap-3 rounded-xl border border-ink/[0.06] bg-white p-3.5 text-[13.5px] font-semibold">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gold-dark" />{h}
                </p>
              ))}
            </div>
            <LeadButton className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-gold-dark" property={p.title} intent="Talk to an Expert" source="Overview Expert">
              Talk to an expert about {p.title} <ArrowRight className="h-4 w-4" />
            </LeadButton>
          </Section>

          {/* ───────── Floor plans ───────── */}
          <Section id="floor-plans" eyebrow={isRent ? 'Rent' : 'Pricing'} title={isRent ? 'Configurations & rent' : 'Floor plans & pricing'}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {p.configurations.map((c, i) => (
                <div key={c.label + i} className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-card">
                  <div className="relative grid aspect-[16/10] place-items-center bg-[repeating-linear-gradient(45deg,#FAF7F1,#FAF7F1_10px,#F3EDE2_10px,#F3EDE2_20px)]">
                    <div className="text-center opacity-70 blur-[1.5px]">
                      <Layers className="mx-auto h-10 w-10 text-gold-dark" />
                      <p className="mt-1 font-display text-lg font-semibold">{c.label}</p>
                    </div>
                    <LeadButton className="absolute inset-x-0 mx-auto w-max rounded-full bg-ink px-4 py-2 text-xs font-bold text-ivory shadow-luxe hover:bg-gold hover:text-ink" property={p.title} intent={`Unlock ${c.label} Floor Plan`} source="Floor Plan">
                      Unlock floor plan
                    </LeadButton>
                  </div>
                  <div className="p-4">
                    <p className="text-[15px] font-bold">{c.label}</p>
                    <p className="text-xs text-muted">{c.area}</p>
                    <p className="mt-2 font-display text-xl font-bold">{c.price}</p>
                    <LeadButton className="mt-3 w-full rounded-full border border-gold py-2 text-xs font-bold text-gold-dark transition hover:bg-gold hover:text-ink" property={p.title} intent={`Price breakup: ${c.label}`} source="Floor Plan Callback">
                      Request callback
                    </LeadButton>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ───────── Amenities ───────── */}
          <Section id="amenities" eyebrow="Lifestyle" title="Amenities">
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
              {p.amenities.map((a) => (
                <p key={a} className="flex items-center gap-2.5 rounded-xl border border-ink/[0.06] bg-white px-3 py-3 text-[12.5px] font-semibold md:px-4 md:text-sm">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold-50"><Sparkles className="h-4 w-4 text-gold-dark" /></span>
                  <span className="min-w-0 leading-snug">{a}</span>
                </p>
              ))}
            </div>
          </Section>

          {/* ───────── Location ───────── */}
          <Section id="location" eyebrow="Locality" title="Location advantages">
            <LocationTabs nearby={p.nearby} mapQuery={p.mapQuery} title={p.title} />
          </Section>

          {/* ───────── Developer ───────── */}
          <Section id="developer" eyebrow="Developer" title={`About ${dev.name}`}>
            <div className="flex flex-col gap-5 rounded-2xl border border-ink/[0.06] bg-white p-5 shadow-card md:flex-row md:items-center md:p-7">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-ink font-display text-2xl font-bold text-gold-light md:h-20 md:w-20 md:text-3xl">
                {dev.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted">Since {dev.established} · {devCount} {devCount === 1 ? 'project' : 'projects'} · {getCity(dev.city)?.name}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-ink/75">{dev.about}</p>
              </div>
              <Link href={`/developers/${dev.slug}`} className="btn-outline shrink-0">All projects <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </Section>

          {/* ───────── RERA ───────── */}
          <Section id="rera" eyebrow="Compliance" title={`${p.title}’s RERA`}>
            <div className="grid gap-4 rounded-2xl border border-ink/[0.06] bg-white p-5 shadow-card md:grid-cols-[1fr_auto] md:items-center md:p-7">
              <div>
                <div className="flex flex-wrap gap-x-10 gap-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">RERA Reg. No.</p>
                    <p className="mt-1 font-display text-xl font-bold">{p.rera}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Authority</p>
                    <p className="mt-1 font-display text-xl font-bold">{portal?.name ?? 'State RERA'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Possession</p>
                    <p className="mt-1 font-display text-xl font-bold">{p.possession}</p>
                  </div>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-ink/70">
                  This is a preview listing. Its registration under the Real Estate (Regulation and Development) Act, 2016 has not been verified by RealtechX yet. Verify the registration number, promoter, approvals and completion date on the {portal?.name ?? 'state RERA'} portal before transacting.
                </p>
                {portal && (
                  <a href={portal.url} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-gold-dark">
                    Verify on {portal.name} <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-ivory p-4 md:flex-col md:p-5 md:text-center">
                <QrCode className="h-14 w-14 shrink-0 text-ink/30 md:h-20 md:w-20" />
                <p className="text-[11px] text-muted">RERA QR code<br />will appear here</p>
              </div>
            </div>
          </Section>

          {/* ───────── EMI ───────── */}
          {!isRent && (
            <Section id="emi" eyebrow="Finance" title="EMI calculator">
              <div className="card p-5 md:p-8"><EmiCalculator defaultAmount={Math.round(p.priceMin * 0.8)} compact /></div>
            </Section>
          )}

          {/* ───────── FAQs ───────── */}
          <Section id="faqs" eyebrow="FAQ" title="Frequently asked questions">
            <Faq items={faqs} />
          </Section>

          {/* ───────── Interested CTA ───────── */}
          <div className="mt-12 overflow-hidden rounded-3xl bg-ink text-ivory">
            <div className="relative p-6 md:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
              <p className="eyebrow !text-gold-light">Next step</p>
              <h2 className="mt-2 font-display text-[26px] font-semibold leading-tight md:text-4xl">Interested in {p.title}?</h2>
              <p className="mt-2 max-w-lg text-[14px] text-ivory/65">Free expert guidance, site-visit booking and the best available price — with zero brokerage.</p>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <LeadButton className="btn-gold col-span-2 sm:col-span-1" property={p.title} intent="I'm Interested" source="Bottom CTA" image={p.images[0]}>I’m interested</LeadButton>
                <LeadButton className="btn-ghost-light !px-4" property={p.title} intent="Book Site Visit" source="Bottom CTA Visit"><CalendarCheck className="h-4 w-4" /> Book visit</LeadButton>
                <a href={wa} target="_blank" rel="noopener" className="btn-ghost-light !px-4"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                <a href={`tel:${site.phoneRaw}`} className="btn-ghost-light col-span-2 !px-4 sm:col-span-1"><Phone className="h-4 w-4" /> {site.phone}</a>
              </div>
            </div>
          </div>

          <p className="mt-6 flex items-start gap-2 text-[11.5px] leading-relaxed text-muted">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Preview listing for demonstration. Prices, images and specifications are indicative and may change. Listed on {formatDate(p.postedOn)}.
          </p>
        </div>

        {/* ───────── Sidebar ───────── */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 pt-8">
            <div className="overflow-hidden rounded-3xl border border-ink/[0.06] bg-white shadow-luxe">
              <div className="relative bg-ink p-6 text-ivory">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/25 blur-2xl" />
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold-light">{isRent ? 'Rent from' : 'Starting from'}</p>
                <p className="mt-1 font-display text-3xl font-bold">{startPrice(p)}</p>
                <p className="mt-1 text-xs text-ivory/60">{configLabel(p)} · {areaRange(p)}</p>
              </div>
              <div className="p-6">
                <p className="mb-1 font-bold">Get the best price & offers</p>
                <p className="mb-4 flex items-center gap-1.5 text-xs text-muted"><BadgeCheck className="h-3.5 w-3.5 text-gold-dark" /> Zero brokerage · Free site visit</p>
                <LeadForm source="Property Sidebar" property={p.title} intent="Get Best Price" cta="Get best price" showEmail={false} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${site.phoneRaw}`} className="btn-ink"><Phone className="h-4 w-4" /> Call</a>
              <a href={wa} target="_blank" rel="noopener" className="btn bg-[#25D366] text-white"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
            </div>
          </div>
        </aside>
      </div>

      {/* ───────── Similar ───────── */}
      <section className="border-t border-ink/5 bg-white py-12 md:py-20">
        <div className="container">
          <div className="mb-7 flex items-end justify-between gap-4 md:mb-10">
            <div>
              <p className="eyebrow">You may also like</p>
              <h2 className="h-section mt-2.5">Similar properties</h2>
            </div>
            <Link href={`/properties?city=${p.city}`} className="shrink-0 pb-1 text-[13px] font-bold text-gold-dark">View all <ArrowRight className="inline h-4 w-4" /></Link>
          </div>
          <Carousel label="Similar properties">
            {similar.map((s) => <PropertyCard key={s.id} p={s} />)}
          </Carousel>

          {nearbyLocalities.length > 0 && (
            <div className="mt-12">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted">Localities near {p.locality}</p>
              <div className="flex flex-wrap gap-2">
                {nearbyLocalities.map((l) => (
                  <Link key={l.slug} href={`/city/${p.city}/${l.slug}`} className="chip">{l.name}, {city.name}</Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ───────── Mobile sticky bar ───────── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_-15px_rgba(11,16,32,.3)] backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted">{p.title}</p>
            <p className="font-display text-lg font-bold leading-tight">{startPrice(p)}</p>
          </div>
          <a href={`tel:${site.phoneRaw}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink/15" aria-label="Call"><Phone className="h-4 w-4" /></a>
          <a href={wa} target="_blank" rel="noopener" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
          <LeadButton className="btn-gold shrink-0 !px-5 !py-3" property={p.title} intent="Get Best Price" source="Mobile Sticky Bar" image={p.images[0]}>Enquire</LeadButton>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 pt-12 md:scroll-mt-40 md:pt-16">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mb-5 mt-2 font-display text-[24px] font-semibold leading-tight md:mb-7 md:text-[34px]">{title}</h2>
      {children}
    </section>
  );
}
