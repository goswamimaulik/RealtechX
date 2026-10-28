import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight, BadgeCheck, Building, CalendarCheck, CalendarClock, CheckCircle2, Download, ExternalLink, FileText, Layers, MapPin, Maximize2, MessageCircle, Phone, QrCode, ShieldCheck,
} from 'lucide-react';
import Gallery from '@/components/Gallery';
import PropertyActions from '@/components/PropertyActions';
import PropertyCard from '@/components/PropertyCard';
import LeadForm from '@/components/LeadForm';
import EmiCalculator from '@/components/EmiCalculator';
import Carousel from '@/components/Carousel';
import LocationTabs from '@/components/LocationTabs';
import FloorPlans from '@/components/property/FloorPlans';
import Amenities from '@/components/property/Amenities';
import MobileStickyBar from '@/components/property/MobileStickyBar';
import { AutoLeadPopup, LeadButton } from '@/components/LeadButtons';
import { Breadcrumbs, Faq } from '@/components/ui';
import ViewTracker from '@/components/ViewTracker';
import Image from '@/components/SmartImage';
import { getStore, propertyOf, cityOf, developerOf, localitiesIn, cardOf, reraFor } from '@/lib/server/store';
import { buildMeta } from '@/lib/server/seo';
import { areaRange, configLabel, contactOf, formatDate, priceRange, startPrice, titleCase } from '@/lib/format';
import SectionNav from '@/components/property/SectionNav';

/** YouTube / Vimeo link → embeddable URL */
function embedOf(url?: string) {
  if (!url) return '';
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return '';
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getStore();
  const p = propertyOf(s, slug);
  if (!p) return {};
  const city = cityOf(s, p.city)?.name ?? '';
  const title = `${p.title}, ${p.locality} ${city} — ${configLabel(p)} | ${priceRange(p)}`;
  return buildMeta(p.seo, {
    title,
    description: `${p.tagline}. ${(p.description[0] ?? '').slice(0, 120)}…`,
    image: p.images[0],
    canonical: `/property/${p.slug}`,
  }, s.settings.name);
}

const statusTone: Record<string, string> = {
  'new-launch': 'bg-gold text-ink',
  'under-construction': 'bg-ink text-gold-light',
  'ready-to-move': 'bg-emerald-500 text-white',
};
const nounOf: Record<string, string> = { residential: 'Apartment', villa: 'Villa' };

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getStore();
  const site = s.settings;
  const p = propertyOf(s, slug);
  if (!p) notFound();
  const city = cityOf(s, p.city) ?? { slug: p.city, name: p.city, state: '', image: p.images[0], blurb: '' };
  const dev = developerOf(s, p.developer) ?? { slug: p.developer, name: p.developer || 'Developer', city: p.city, established: 0, tagline: '', about: '', specialties: [], cover: p.images[0] };
  const portal = reraFor(s, city.state);
  const isRent = p.listingFor === 'rent';
  const devCount = s.properties.filter((x) => x.developer === dev.slug).length;
  const video = embedOf(p.videoUrl);
  const mapQuery = p.lat && p.lng ? `${p.lat},${p.lng}` : p.mapQuery || `${p.locality}, ${city.name}`;
  const similar = s.properties
    .filter((x) => x.id !== p.id)
    .map((x) => ({ x, score: (x.city === p.city ? 2 : 0) + (x.type === p.type ? 2 : 0) + (x.listingFor === p.listingFor ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.x);
  const nearbyLocalities = localitiesIn(s, p.city).filter((l) => l.slug !== p.localitySlug);
  const contact = contactOf(p, site);
  const phoneDisplay = contact.tel === site.phoneRaw ? site.phone : contact.tel.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2');
  const wa = `https://wa.me/${contact.wa}?text=${encodeURIComponent(`Hi, I am interested in ${p.title} (${p.id}), ${p.locality}.`)}`;

  const keyFacts = [
    { k: 'Configuration', v: configLabel(p) },
    { k: 'Area', v: areaRange(p) },
    { k: isRent ? 'Monthly rent' : 'Price range', v: priceRange(p) },
    { k: 'Possession', v: p.possession },
    { k: 'Status', v: titleCase(p.status) },
    { k: 'Locality', v: `${p.locality}, ${city.name}` },
    { k: 'Developer', v: dev.name },
    { k: 'Land parcel', v: p.landParcel },
    { k: 'Total units', v: p.totalUnits },
    { k: 'RERA ID', v: p.rera },
    ...(p.furnishing ? [{ k: 'Furnishing', v: p.furnishing }] : []),
    ...(p.subType ? [{ k: 'Property type', v: p.subType }] : []),
  ];

  const faqs = [
    { q: `What is the price of ${p.title}?`, a: p.priceMin ? `${p.title} in ${p.locality}, ${city.name} is priced at ${priceRange(p)}${p.source === 'published' ? ' as published' : ''}, depending on configuration, floor and view.` : `The price of ${p.title} is available on request — share your details and we will send the latest price sheet.` },
    { q: `Which configurations are available in ${p.title}?`, a: `${p.title} offers ${p.configurations.map((c) => (c.area === 'On request' ? c.label : `${c.label} (${c.area})`)).join(', ')}.` },
    { q: `Who is the developer of ${p.title}?`, a: `${p.title} is developed by ${dev.name}${dev.established ? `, established in ${dev.established}` : ''}.` },
    { q: `What is the possession date of ${p.title}?`, a: `The possession timeline for ${p.title} is ${p.possession}.` },
    { q: `Is ${p.title} RERA registered?`, a: /^Verify|Awaiting/.test(p.rera) ? `${site.name} has not verified the RERA registration of ${p.title} yet. Always check the project on the ${portal?.name ?? 'state RERA'} portal before booking.` : `The published RERA registration number for ${p.title} is ${p.rera}. Please verify it on the ${portal?.name ?? 'state RERA'} portal before booking.` },
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

  const tabs = ['Overview', 'Floor plans', video ? 'Video' : '', 'Amenities', 'Location', 'Developer', 'RERA', isRent ? '' : 'EMI', 'FAQs'].filter(Boolean);
  const anchor = (t: string) => t.toLowerCase().replace(/\s+/g, '-');

  return (
    <>
      <ViewTracker id={p.id} />
      <AutoLeadPopup storageKey={p.id} property={p.title} intent="Get Best Price" image={p.images[0]} title={`Get the best price for ${p.title}`} subtitle="Price sheet, floor plans & current offers on WhatsApp in under 2 minutes." />

      {/* ───────── Gallery ───────── */}
      <div className="container lg:pt-6">
        <div className="hidden pb-4 text-ink lg:block">
          <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: `/city/${city.slug}`, label: city.name }, { href: `/city/${city.slug}/${p.localitySlug}`, label: p.locality }, { label: p.title }]} />
        </div>
        <Gallery images={p.images} title={p.title} />
      </div>

      <div className="container grid gap-10 pb-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-20 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {/* ───────── Title block ───────── */}
          <div className="pt-5 lg:pt-8">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider ${statusTone[p.status]}`}>{titleCase(p.status)}</span>
              <span className="rounded-full bg-gold-50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-gold-dark">{titleCase(p.type)} · For {isRent ? 'rent' : 'sale'}</span>
              {p.featured && <span className="rounded-full border border-gold/50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-gold-dark">Featured</span>}
              {p.source === 'published' ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-700">Details as published</span>
              ) : (
                <span className="rounded-full bg-ivory-200 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted">Sample listing</span>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <h1 className="font-display text-[28px] font-semibold leading-[1.1] md:text-[40px]">{p.title}</h1>
                <p className="mt-1.5 text-[15px] text-ink/70">{p.tagline}</p>
                <p className="mt-2 flex items-start gap-1.5 text-[13.5px] text-ink/70">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                  <span>{p.locality}, {city.name}, {city.state} · <a href="#location" className="font-semibold text-ink underline decoration-gold underline-offset-4">View on map</a></span>
                </p>
                <p className="mt-1 text-[13.5px] text-muted">by <Link href={`/developers/${dev.slug}`} className="font-semibold text-ink underline decoration-gold underline-offset-4">{dev.name}</Link></p>
              </div>
              <div className="shrink-0 md:text-right">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{isRent ? 'Rent' : 'Price'}</p>
                <p className="font-display text-[28px] font-semibold leading-tight md:text-[34px]">{priceRange(p)}</p>
                <p className="text-[12px] text-muted">{isRent ? 'Per month · maintenance extra' : 'All-inclusive price on request'}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 md:mt-7 md:gap-3">
              {[
                { Icon: Building, k: 'Configuration', v: configLabel(p) },
                { Icon: Maximize2, k: 'Area', v: areaRange(p) },
                { Icon: CalendarClock, k: 'Possession', v: p.possession },
                { Icon: Layers, k: 'Units', v: p.totalUnits },
              ].map(({ Icon, k, v }) => (
                <div key={k} className="min-w-0 rounded-2xl border border-ink/[0.07] bg-white p-3.5 md:p-4">
                  <Icon className="h-[18px] w-[18px] text-gold-dark" />
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-muted">{k}</p>
                  <p className="mt-0.5 text-[14px] font-semibold leading-snug">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 md:mt-5">
              <PropertyActions id={p.id} title={p.title} />
              <LeadButton className="btn-outline !px-4 !py-2.5 text-[13px]" property={p.title} intent="Download Brochure" source="Brochure (title)" image={p.images[1]} title={`Download the ${p.title} brochure`} subtitle="We’ll send the brochure, price sheet and floor plans to your WhatsApp.">
                <Download className="h-4 w-4" /> Brochure
              </LeadButton>
            </div>
          </div>

          {/* ───────── Section nav ───────── */}
          <SectionNav items={tabs.map((t) => ({ id: anchor(t), label: t }))} />

          {/* ───────── Overview + key facts ───────── */}
          <Section id="overview" eyebrow="Overview" title={`About ${p.title}`}>
            <div className="overflow-hidden rounded-[22px] border border-ink/[0.07] bg-white shadow-[0_6px_24px_-14px_rgba(11,16,32,.25)]">
              <dl className="grid sm:grid-cols-2">
                {keyFacts.map((f, i) => (
                  <div key={f.k} className={`flex items-center justify-between gap-4 border-ink/[0.06] px-4 py-3 text-[14px] md:px-6 ${i > 0 ? 'border-t' : ''} ${i === 1 ? 'sm:border-t-0' : ''} ${i % 2 === 0 ? 'sm:border-r' : ''}`}>
                    <dt className="shrink-0 text-muted">{f.k}</dt>
                    <dd className="min-w-0 truncate text-right font-semibold" title={f.v}>{f.v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-2 border-t border-ink/[0.06] bg-ivory/50 p-4 sm:flex-row md:px-6">
                {portal && (
                  <a href={portal.url} target="_blank" rel="noopener" className="btn-outline !py-2.5 text-[13px]">
                    <ShieldCheck className="h-4 w-4 text-gold-dark" /> Check RERA status <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <LeadButton className="btn-ink !py-2.5 text-[13px]" property={p.title} intent="Download Brochure" source="Brochure (key facts)" image={p.images[2]} title={`Download the ${p.title} brochure`} subtitle="We’ll send the brochure, price sheet and floor plans to your WhatsApp.">
                  <Download className="h-4 w-4" /> Download brochure
                </LeadButton>
              </div>
            </div>

            <div className="prose-luxe mt-7">
              {p.description.map((d, i) => <p key={i}>{d}</p>)}
            </div>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {p.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 rounded-2xl border border-ink/[0.07] bg-white p-3.5 text-[14px] font-medium">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gold-dark" />{h}
                </li>
              ))}
            </ul>
            <LeadButton className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-gold-dark hover:underline" property={p.title} intent="Talk to an Expert" source="Overview Expert">
              Talk to an expert about {p.title} <ArrowRight className="h-4 w-4" />
            </LeadButton>
          </Section>

          {/* ───────── Floor plans (tabs) ───────── */}
          <Section id="floor-plans" eyebrow={isRent ? 'Rent' : 'Pricing'} title={isRent ? 'Configurations & rent' : 'Floor plans & pricing'}>
            <FloorPlans configs={p.configurations} property={p.title} noun={nounOf[p.type]} />
          </Section>

          {video && (
            <Section id="video" eyebrow="Walkthrough" title="Project video">
              <div className="relative aspect-video overflow-hidden rounded-[22px] bg-ink">
                <iframe src={video} title={`${p.title} video`} className="absolute inset-0 h-full w-full border-0" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
              </div>
            </Section>
          )}

          {/* ───────── Amenities ───────── */}
          <Section id="amenities" eyebrow="Lifestyle" title="Amenities">
            <Amenities items={p.amenities} property={p.title} />
          </Section>

          {/* ───────── Location ───────── */}
          <Section id="location" eyebrow="Locality" title="Location advantages">
            <LocationTabs nearby={p.nearby} mapQuery={mapQuery} title={p.title} locality={p.locality} zoom={site.maps.defaultZoom || 13} />
            {p.address && <p className="mt-4 flex items-start gap-2 text-[13.5px] text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />{p.address}</p>}
          </Section>

          {/* ───────── Developer ───────── */}
          <Section id="developer" eyebrow="Developer" title={`About ${dev.name}`}>
            <div className="flex flex-col gap-5 rounded-[22px] border border-ink/[0.07] bg-white p-5 shadow-[0_6px_24px_-14px_rgba(11,16,32,.25)] md:flex-row md:items-center md:p-7">
              {dev.logo ? (
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-white md:h-20 md:w-20">
                  <Image src={dev.logo} alt={`${dev.name} logo`} fill sizes="80px" className="object-contain p-1.5" />
                </span>
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-ink font-display text-2xl font-semibold text-gold-light md:h-20 md:w-20 md:text-3xl">
                  {dev.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium text-muted">{dev.established ? `Since ${dev.established} · ` : ''}{devCount} {devCount === 1 ? 'project' : 'projects'}{cityOf(s, dev.city) ? ` · ${cityOf(s, dev.city)?.name}` : ''}</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink/75">{dev.about}</p>
              </div>
              <Link href={`/developers/${dev.slug}`} className="btn-outline shrink-0">All projects <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </Section>

          {/* ───────── RERA ───────── */}
          <Section id="rera" eyebrow="Compliance" title={`${p.title}’s RERA`}>
            <div className="grid gap-5 rounded-[22px] border border-ink/[0.07] bg-white p-5 shadow-[0_6px_24px_-14px_rgba(11,16,32,.25)] md:grid-cols-[1fr_auto] md:items-center md:p-7">
              <div className="min-w-0">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { k: 'RERA Reg. No.', v: p.rera },
                    { k: 'Authority', v: portal?.name ?? 'State RERA' },
                    { k: 'Possession', v: p.possession },
                  ].map((f) => (
                    <div key={f.k}>
                      <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{f.k}</dt>
                      <dd className="mt-1 font-display text-[18px] font-semibold">{f.v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-[13.5px] leading-relaxed text-ink/70">
                  This is a preview listing. Its registration under the Real Estate (Regulation and Development) Act, 2016 has not been verified by {site.name} yet. Verify the registration number, promoter, approvals and completion date on the {portal?.name ?? 'state RERA'} portal before transacting.
                </p>
                {portal && (
                  <a href={portal.url} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-gold-dark hover:underline">
                    Verify on {portal.name} <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-ivory p-4 md:flex-col md:p-5 md:text-center">
                {p.reraQr ? (
                  <>
                    <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white md:h-28 md:w-28">
                      <Image src={p.reraQr} alt={`${p.title} RERA QR code`} fill sizes="112px" className="object-contain" />
                    </span>
                    <p className="text-[12px] text-muted">Scan to verify<br />on the RERA portal</p>
                  </>
                ) : (
                  <>
                    <QrCode className="h-14 w-14 shrink-0 text-ink/30 md:h-20 md:w-20" />
                    <p className="text-[12px] text-muted">RERA QR code<br />will appear here</p>
                  </>
                )}
              </div>
            </div>
          </Section>

          {/* ───────── EMI ───────── */}
          {!isRent && (
            <Section id="emi" eyebrow="Finance" title="EMI calculator">
              <div className="rounded-[22px] border border-ink/[0.07] bg-white p-5 md:p-8"><EmiCalculator defaultAmount={Math.round(p.priceMin * 0.8)} compact /></div>
            </Section>
          )}

          {/* ───────── FAQs ───────── */}
          <Section id="faqs" eyebrow="FAQ" title="Frequently asked questions">
            <Faq items={faqs} />
          </Section>

          {/* ───────── Interested CTA ───────── */}
          <div className="relative mt-12 overflow-hidden rounded-[28px] bg-ink p-6 text-ivory md:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
            <p className="eyebrow relative !text-gold-light">Next step</p>
            <h2 className="relative mt-2 font-display text-[26px] font-semibold leading-tight md:text-[36px]">Interested in {p.title}?</h2>
            <p className="relative mt-2 max-w-lg text-[14.5px] text-ivory/65">Free expert guidance, site-visit booking and the best available price — with zero brokerage.</p>
            <div className="relative mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <LeadButton className="btn-gold col-span-2 sm:col-span-1" property={p.title} intent="I'm Interested" source="Bottom CTA" image={p.images[0]}>I’m interested <ArrowRight className="h-4 w-4" /></LeadButton>
              <LeadButton className="btn-ghost-light !px-4" property={p.title} intent="Book Site Visit" source="Bottom CTA Visit"><CalendarCheck className="h-4 w-4" /> Book visit</LeadButton>
              <a href={wa} target="_blank" rel="noopener" className="btn-ghost-light !px-4"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              <a href={`tel:${contact.tel}`} className="btn-ghost-light col-span-2 !px-4 sm:col-span-1"><Phone className="h-4 w-4" /> {phoneDisplay}</a>
            </div>
          </div>

          <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-muted">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {p.source === 'published' ? 'Details compiled from information published by the developer and property portals; images are representative. Verify the latest price, availability and RERA registration with the developer.' : 'Sample listing for demonstration. Prices, images and specifications are indicative.'} Listed on {formatDate(p.postedOn)}.
          </p>
        </div>

        {/* ───────── Sidebar ───────── */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 pt-8">
            <div className="overflow-hidden rounded-[26px] border border-ink/[0.07] bg-white shadow-luxe">
              <div className="relative overflow-hidden bg-ink p-6 text-ivory">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/25 blur-2xl" />
                <p className="relative text-[11px] font-medium uppercase tracking-[0.2em] text-gold-light">{isRent ? 'Rent from' : 'Starting from'}</p>
                <p className="relative mt-1 font-display text-[30px] font-semibold">{startPrice(p)}</p>
                <p className="relative mt-1 text-[12.5px] text-ivory/60">{configLabel(p)} · {areaRange(p)}</p>
              </div>
              <div className="p-6">
                <p className="mb-1 font-semibold">Get the best price & offers</p>
                <p className="mb-4 flex items-center gap-1.5 text-[12.5px] text-muted"><BadgeCheck className="h-3.5 w-3.5 text-gold-dark" /> Zero brokerage · Free site visit</p>
                <LeadForm source="Property Sidebar" property={p.title} intent="Get Best Price" cta="Get best price" showEmail={false} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${contact.tel}`} className="btn-ink"><Phone className="h-4 w-4" /> Call</a>
              <a href={wa} target="_blank" rel="noopener" className="btn bg-[#25D366] text-white"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
            </div>
          </div>
        </aside>
      </div>

      {/* ───────── Similar ───────── */}
      <section className="border-t border-ink/[0.06] bg-white py-12 md:py-20">
        <div className="container">
          <div className="mb-7 flex items-end justify-between gap-4 md:mb-10">
            <div>
              <p className="eyebrow">You may also like</p>
              <h2 className="h-section mt-2.5">Similar properties</h2>
            </div>
            <Link href={`/properties?city=${p.city}`} className="shrink-0 pb-1 text-[13.5px] font-semibold text-gold-dark hover:underline">View all <ArrowRight className="inline h-4 w-4" /></Link>
          </div>
          <Carousel label="Similar properties">
            {similar.map((x) => <PropertyCard key={x.id} p={cardOf(s, x)} />)}
          </Carousel>

          {nearbyLocalities.length > 0 && (
            <div className="mt-12">
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">Localities near {p.locality}</p>
              <div className="flex flex-wrap gap-2">
                {nearbyLocalities.map((l) => (
                  <Link key={l.slug} href={`/city/${p.city}/${l.slug}`} className="chip">{l.name}, {city.name}</Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <MobileStickyBar title={p.title} id={p.id} price={startPrice(p) + (isRent || !p.priceMin ? '' : ' onwards')} image={p.images[0]} wa={wa} tel={contact.tel} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 pt-12 md:pt-16 lg:scroll-mt-40">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mb-5 mt-2 font-display text-[24px] font-semibold leading-tight md:mb-7 md:text-[32px]">{title}</h2>
      {children}
    </section>
  );
}
