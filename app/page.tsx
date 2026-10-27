import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Building2, Calculator, Handshake, Home, Landmark, LineChart, MapPin, MapPinned, ShieldCheck, Trees, Users, Warehouse,
} from 'lucide-react';
import Image from '@/components/SmartImage';
import HeroSearch from '@/components/HeroSearch';
import PropertyCard from '@/components/PropertyCard';
import StatusTabs from '@/components/StatusTabs';
import EmiCalculator from '@/components/EmiCalculator';
import Carousel from '@/components/Carousel';
import CityExplorer from '@/components/CityExplorer';
import PhoneShowcase from '@/components/PhoneShowcase';
import Reviews from '@/components/Reviews';
import { LeadButton } from '@/components/LeadButtons';
import { SectionHeading } from '@/components/ui';
import { properties, allLocalities } from '@/lib/data/properties';
import { getCity } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';
import { blogs } from '@/lib/data/blogs';
import { img } from '@/lib/data/images';
import { navTypes } from '@/lib/site';
import { formatDate } from '@/lib/format';

const typeMeta: Record<string, { icon: React.ElementType; text: string; image: string }> = {
  residential: { icon: Home, text: 'Apartments, penthouses & sky residences', image: img.apartment[1] },
  commercial: { icon: Building2, text: 'Offices, retail & business parks', image: img.commercial[5] },
  plot: { icon: MapPinned, text: 'Gated, approved residential plots', image: img.villa[6] },
  land: { icon: Trees, text: 'Farmland & investment land', image: img.land[1] },
  villa: { icon: Warehouse, text: 'Private villas with pools & gardens', image: img.villa[1] },
};

export default function HomePage() {
  const featured = properties.filter((p) => p.featured);
  const latest = [...properties].sort((a, b) => b.postedOn.localeCompare(a.postedOn)).slice(0, 8);
  const localities = allLocalities();

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative isolate overflow-hidden bg-ink">
        <Image src={img.villa[1]} alt="Luxury residence with pool at dusk" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,16,32,.82)_0%,rgba(11,16,32,.55)_40%,rgba(11,16,32,.92)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(201,164,92,.18),transparent_55%)]" />

        <div className="container flex min-h-[calc(100svh-96px)] flex-col justify-center py-12 md:min-h-[680px] md:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow animate-fadeUp !text-gold-light">India’s premium property portal</p>
            <h1 className="mt-4 animate-fadeUp text-balance font-display text-[36px] font-semibold leading-[1.08] text-ivory sm:text-5xl md:mt-5 md:text-[68px]">
              Find a home that matches your <span className="gold-text italic">ambition</span>
            </h1>
            <p className="mt-4 max-w-xl animate-fadeUp text-[14.5px] leading-relaxed text-ivory/75 md:mt-5 md:text-lg">
              Apartments, villas, offices, plots and land across Mumbai, Pune, Bangalore, Hyderabad, Ahmedabad and Surat — with complete details and real advisors.
            </p>
          </div>

          <div className="mt-7 animate-fadeUp md:mt-10">
            <HeroSearch />
          </div>

          <div className="mt-5 flex flex-col gap-2 md:mt-6 md:flex-row md:items-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ivory/60">Popular:</span>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
              {[
                { href: '/city/mumbai/worli', l: 'Worli' },
                { href: '/city/pune/baner', l: 'Baner' },
                { href: '/city/hyderabad/kokapet', l: 'Kokapet' },
                { href: '/city/bangalore/devanahalli', l: 'Devanahalli' },
                { href: '/city/ahmedabad/sindhu-bhavan-road', l: 'Sindhu Bhavan Rd' },
                { href: '/city/surat/vesu', l: 'Vesu' },
              ].map((t) => (
                <Link key={t.href} href={t.href} className="shrink-0 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-ivory/85 backdrop-blur transition hover:border-gold hover:text-gold-light">
                  {t.l}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 hidden flex-wrap gap-x-8 gap-y-3 text-sm text-ivory/75 md:flex">
            {[
              { Icon: ShieldCheck, t: 'Complete project details' },
              { Icon: Handshake, t: 'Zero brokerage enquiries' },
              { Icon: Users, t: 'Real advisors, quick call back' },
            ].map(({ Icon, t }) => (
              <span key={t} className="flex items-center gap-2"><Icon className="h-4 w-4 text-gold" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PROPERTY TYPES ───────── */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Explore by category" title={<>Every kind of property, <span className="italic text-gold-dark">one address</span></>} text="From sea-facing sky residences to farmland in the Sahyadris — start with what you are looking for." />
          <Carousel label="Property categories" itemClassName="w-[calc(50%-6px)] md:w-[calc(33.333%-13.4px)] lg:w-[calc(20%-16px)]">
            {navTypes.map((t) => {
              const meta = typeMeta[t.slug];
              const Icon = meta.icon;
              const count = properties.filter((p) => p.type === t.slug).length;
              return (
                <Link key={t.slug} href={`/property-type/${t.slug}`} className="group relative isolate flex h-[250px] flex-col justify-end overflow-hidden rounded-2xl p-4 text-ivory md:h-[340px] md:p-6">
                  <Image src={meta.image} alt={`${t.label} property`} fill sizes="(max-width:768px) 50vw, 20vw" className="-z-10 object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                  <span className="mb-auto grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur md:h-11 md:w-11"><Icon className="h-[18px] w-[18px] text-gold-light" /></span>
                  <p className="font-display text-2xl font-semibold md:text-3xl">{t.label}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-ivory/70 md:text-xs">{meta.text}</p>
                  <p className="mt-3 flex items-center justify-between border-t border-white/15 pt-2.5 text-[11px] font-bold md:mt-4 md:pt-3 md:text-xs">
                    {count} listings <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </p>
                </Link>
              );
            })}
          </Carousel>
        </div>
      </section>

      {/* ───────── FEATURED ───────── */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading eyebrow="Handpicked for you" title="Featured projects" text="Our advisors’ pick of the most promising launches and ready homes this month." action={{ href: '/properties?sort=featured', label: 'View all properties' }} />
          <Carousel label="Featured projects">
            {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
          </Carousel>
        </div>
      </section>

      {/* ───────── CITIES (tabbed) ───────── */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Explore by location" title="Projects by city & locality" text="Pick a city to see its localities, project counts, starting prices and top projects." action={{ href: '/localities', label: 'All localities' }} />
          <CityExplorer />
        </div>
      </section>

      {/* ───────── STATUS ───────── */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading eyebrow="By project stage" title="New launches to ready-to-move homes" center />
          <StatusTabs items={properties} />
        </div>
      </section>

      {/* ───────── PHONE SHOWCASE ───────── */}
      <PhoneShowcase featured={featured} />

      {/* ───────── NEWLY ADDED ───────── */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Fresh on RealtechX" title="Newly added properties" action={{ href: '/properties', label: 'See all listings' }} />
          <Carousel label="Newly added">
            {latest.map((p) => <PropertyCard key={p.id} p={p} />)}
          </Carousel>
        </div>
      </section>

      {/* ───────── DEVELOPERS 4 + 4 ───────── */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading eyebrow="Builders we feature" title="Top developers" text="Explore every project by the developers listed on RealtechX." center />
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {developers.slice(0, 8).map((d) => {
              const count = properties.filter((p) => p.developer === d.slug).length;
              return (
                <Link key={d.slug} href={`/developers/${d.slug}`} className="group flex flex-col items-center rounded-2xl border border-ink/[0.06] bg-ivory/60 p-4 text-center transition hover:-translate-y-1 hover:border-gold/40 hover:bg-white hover:shadow-luxe md:flex-row md:items-center md:gap-4 md:p-5 md:text-left">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink font-display text-lg font-bold text-gold-light md:h-16 md:w-16 md:text-xl">
                    {d.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                  </span>
                  <span className="mt-3 min-w-0 md:mt-0">
                    <span className="line-clamp-2 text-[13px] font-bold leading-snug group-hover:text-gold-dark md:text-[15px]">{d.name}</span>
                    <span className="mt-1 block text-[11px] text-muted md:text-xs">Since {d.established} · {count} {count === 1 ? 'project' : 'projects'}</span>
                    <span className="mt-0.5 block text-[11px] text-muted md:text-xs">{getCity(d.city)?.name}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center md:mt-10">
            <Link href="/developers" className="btn-ink">View all developers <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* ───────── EMI ───────── */}
      <section className="section" id="emi">
        <div className="container">
          <SectionHeading eyebrow="Plan your finances" title={<><Calculator className="mr-2 inline h-7 w-7 text-gold-dark md:h-9 md:w-9" />Home loan EMI calculator</>} action={{ href: '/home-loan', label: 'Home loan guide' }} />
          <div className="card p-5 md:p-10">
            <EmiCalculator />
          </div>
        </div>
      </section>

      {/* ───────── WHY US ───────── */}
      <section className="section bg-ink text-ivory">
        <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-[5/6]">
            <Image src={img.apartment[6]} alt="Premium living room" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-ink/75 p-4 backdrop-blur md:bottom-5 md:left-5 md:right-5 md:p-5">
              <p className="font-display text-lg font-semibold md:text-2xl">“We help you decide — not just discover.”</p>
              <p className="mt-1 text-xs text-ivory/60">The RealtechX promise</p>
            </div>
          </div>
          <div>
            <p className="eyebrow !text-gold-light">Why RealtechX</p>
            <h2 className="h-section mt-3">A calmer, clearer way to buy property</h2>
            <p className="mt-4 text-[15px] text-ivory/65">Every listing is presented with complete pricing, configurations, amenities and location insights — so you spend less time chasing details and more time deciding.</p>
            <div className="mt-8 grid grid-cols-2 gap-5 md:mt-10 md:gap-6">
              {[
                { Icon: BadgeCheck, t: 'Complete details', d: 'Prices, plans & possession on one page.' },
                { Icon: Handshake, t: 'Zero brokerage', d: 'Enquire and book visits at no cost.' },
                { Icon: LineChart, t: 'Market insight', d: 'Locality guides & investment analysis.' },
                { Icon: Landmark, t: 'Loan support', d: 'Compare offers, calculate EMI instantly.' },
              ].map(({ Icon, t, d }) => (
                <div key={t}>
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 md:h-12 md:w-12"><Icon className="h-5 w-5 text-gold" /></span>
                  <p className="mt-3 text-[14px] font-bold md:mt-4 md:text-base">{t}</p>
                  <p className="mt-1 text-[12.5px] text-ivory/60 md:text-sm">{d}</p>
                </div>
              ))}
            </div>
            <LeadButton className="btn-gold mt-9 w-full sm:w-auto" intent="Talk to an Advisor" source="Home Why Us">Talk to an advisor</LeadButton>
          </div>
        </div>
      </section>

      {/* ───────── REVIEWS ───────── */}
      <Reviews />

      {/* ───────── SELL CTA (luxury) ───────── */}
      <section className="section">
        <div className="container">
          <div className="relative isolate overflow-hidden rounded-[28px] bg-ink text-ivory md:rounded-[36px]">
            <Image src={img.villa[4]} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-40" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
            <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-gold/25 md:inset-4 md:rounded-[28px]" />
            <div className="grid gap-10 p-7 md:p-14 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="eyebrow !text-gold-light">For owners, builders & channel partners</p>
                <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.1] md:text-5xl">Sell or rent out your property <span className="gold-text italic">faster</span></h2>
                <p className="mt-4 max-w-lg text-[15px] text-ivory/70">List on RealtechX and reach serious buyers and tenants searching every day — with a premium listing page your property deserves.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/sell" className="btn-gold">Post property free <ArrowRight className="h-4 w-4" /></Link>
                  <LeadButton className="btn-ghost-light" intent="Talk to Listing Team" source="Home Sell CTA" title="Talk to our listing team">Talk to our team</LeadButton>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { n: '0 ₹', t: 'Listing fee' },
                  { n: '24 h', t: 'Listing goes live' },
                  { n: '6', t: 'Cities covered' },
                  { n: '1:1', t: 'Dedicated manager' },
                ].map((s) => (
                  <div key={s.t} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur md:p-6">
                    <p className="font-display text-3xl font-semibold text-gold-light md:text-4xl">{s.n}</p>
                    <p className="mt-1 text-xs text-ivory/65 md:text-sm">{s.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── POPULAR LOCALITIES ───────── */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading eyebrow="Where buyers are looking" title="Popular localities" action={{ href: '/localities', label: 'All localities' }} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {localities.map((l) => {
              const list = properties.filter((p) => p.city === l.city && p.localitySlug === l.slug);
              return (
                <Link key={l.city + l.slug} href={`/city/${l.city}/${l.slug}`} className="group flex items-center gap-3 rounded-2xl border border-ink/[0.06] bg-ivory/60 p-3 transition hover:border-gold/40 hover:bg-white hover:shadow-card md:p-4">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl md:h-14 md:w-14">
                    <Image src={list[0].images[0]} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-bold group-hover:text-gold-dark md:text-sm">{l.name}</span>
                    <span className="flex items-center gap-1 truncate text-[11px] text-muted"><MapPin className="h-3 w-3" />{getCity(l.city)?.name} · {list.length}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── BLOG ───────── */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Insights" title="From the RealtechX journal" action={{ href: '/blog', label: 'View all articles' }} />
          <Carousel label="Blog articles">
            {blogs.slice(0, 6).map((b) => (
              <Link key={b.slug} href={`/blog/${b.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-card">
                <div className="relative aspect-[4/3] overflow-hidden md:aspect-[16/11]">
                  <Image src={b.cover} alt={b.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink md:left-3 md:top-3 md:text-[10px]">{b.category}</span>
                </div>
                <div className="flex flex-1 flex-col p-3 md:p-5">
                  <h3 className="line-clamp-3 font-display text-[15px] font-semibold leading-snug group-hover:text-gold-dark md:text-xl">{b.title}</h3>
                  <p className="mt-2 hidden line-clamp-2 text-sm text-muted md:block">{b.excerpt}</p>
                  <p className="mt-auto pt-3 text-[10.5px] font-semibold text-ink/50 md:text-xs">{formatDate(b.date)} · {b.readTime}</p>
                </div>
              </Link>
            ))}
          </Carousel>
          <div className="mt-8 text-center md:mt-10">
            <Link href="/blog" className="btn-outline">View all articles <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
