import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Building2, Handshake, Home, Landmark, LineChart, MapPin, MapPinned, ShieldCheck, Trees, Users, Warehouse,
} from 'lucide-react';
import Image from '@/components/SmartImage';
import ArtImage from '@/components/ArtImage';
import HeroSearch from '@/components/HeroSearch';
import PropertyCard from '@/components/PropertyCard';
import StatusTabs from '@/components/StatusTabs';
import Carousel, { PEEK_SMALL } from '@/components/Carousel';
import CityExplorer from '@/components/CityExplorer';
import PhoneShowcase from '@/components/PhoneShowcase';
import Reviews from '@/components/Reviews';
import BlogCard from '@/components/BlogCard';
import { LeadButton } from '@/components/LeadButtons';
import { SectionHeading } from '@/components/ui';
import { properties, allLocalities, toCard } from '@/lib/data/properties';
import { buildCityExplorer, buildSearchIndex } from '@/lib/nav';
import { statuses } from '@/lib/site';
import { getCity } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';
import { blogs } from '@/lib/data/blogs';
import { img } from '@/lib/data/images';
import { navTypes } from '@/lib/site';

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
  // round-robin across cities so every city is represented in the first rows
  const byCity = new Map<string, ReturnType<typeof allLocalities>>();
  allLocalities().forEach((l) => byCity.set(l.city, [...(byCity.get(l.city) ?? []), l]));
  const rr: ReturnType<typeof allLocalities> = [];
  for (let i = 0; rr.length < 12 && i < 10; i++) byCity.forEach((list) => list[i] && rr.length < 12 && rr.push(list[i]));
  const localities = rr.map((l) => ({ ...l, list: properties.filter((p) => p.city === l.city && p.localitySlug === l.slug) }));

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative isolate overflow-hidden bg-ink">
        <div className="absolute inset-0 -z-20">
          <ArtImage mobile={img.heroMobile} desktop={img.hero} alt="Luxury residence with pool at dusk" priority className="object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,16,32,.78)_0%,rgba(11,16,32,.55)_45%,rgba(11,16,32,.9)_100%)] lg:bg-[linear-gradient(90deg,rgba(11,16,32,.9)_0%,rgba(11,16,32,.65)_55%,rgba(11,16,32,.35)_100%)]" />

        <div className="container flex flex-col justify-center pb-10 pt-12 sm:pb-14 sm:pt-16 lg:min-h-[640px] lg:pb-20 lg:pt-24">
          <div className="max-w-[760px]">
            <p className="eyebrow animate-fadeUp !text-gold-light">India’s premium property portal</p>
            <h1 className="mt-4 animate-fadeUp text-balance font-display text-[34px] font-semibold leading-[1.08] text-white sm:text-[46px] lg:text-[62px]">
              Find a home that matches your <span className="gold-text italic">ambition</span>
            </h1>
            <p className="mt-4 max-w-[560px] animate-fadeUp text-[15px] leading-relaxed text-white/75 lg:text-[17px]">
              Apartments, villas, offices, plots and land across 10 of India’s fastest-growing cities — with complete details and real advisors.
            </p>
          </div>

          <div className="relative z-20 mt-7 max-w-[1080px] animate-fadeUp lg:mt-10">
            <HeroSearch index={buildSearchIndex()} />
          </div>

          <div className="mt-5 flex items-center gap-3 lg:mt-6">
            <span className="shrink-0 text-[12px] font-medium text-white/60">Popular:</span>
            <div className="no-scrollbar -mr-4 flex min-w-0 gap-2 overflow-x-auto pr-4 lg:mr-0 lg:flex-wrap lg:pr-0">
              {[
                { href: '/city/mumbai/worli', l: 'Worli' },
                { href: '/city/pune/baner', l: 'Baner' },
                { href: '/city/hyderabad/kokapet', l: 'Kokapet' },
                { href: '/city/bangalore/devanahalli', l: 'Devanahalli' },
                { href: '/city/ahmedabad/sindhu-bhavan-road', l: 'Sindhu Bhavan Rd' },
                { href: '/city/surat/vesu', l: 'Vesu' },
              ].map((t) => (
                <Link key={t.href} href={t.href} className="shrink-0 rounded-full border border-white/20 bg-white/[0.07] px-3.5 py-1.5 text-[12.5px] text-white/85 backdrop-blur transition hover:border-gold hover:text-gold-light">
                  {t.l}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-9 hidden flex-wrap gap-x-8 gap-y-3 text-[14px] text-white/75 lg:flex">
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
          <Carousel label="Property categories" itemClassName={PEEK_SMALL}>
            {navTypes.map((t) => {
              const meta = typeMeta[t.slug];
              const Icon = meta.icon;
              const count = properties.filter((p) => p.type === t.slug).length;
              return (
                <Link key={t.slug} href={`/property-type/${t.slug}`} className="group relative isolate flex h-[240px] flex-col justify-end overflow-hidden rounded-[20px] p-4 text-white sm:h-[280px] md:p-5 lg:h-[330px]">
                  <Image src={meta.image} alt={`${t.label} property`} fill sizes="(max-width:640px) 46vw, 20vw" className="-z-10 object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
                  <span className="mb-auto grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur"><Icon className="h-[18px] w-[18px] text-gold-light" /></span>
                  <p className="font-display text-[22px] font-semibold md:text-[26px]">{t.label}</p>
                  <p className="mt-1 line-clamp-2 text-[12px] text-white/70">{meta.text}</p>
                  <p className="mt-3 flex items-center justify-between border-t border-white/15 pt-2.5 text-[12px] font-semibold">
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
            {featured.map((p) => <PropertyCard key={p.id} p={toCard(p)} />)}
          </Carousel>
        </div>
      </section>

      {/* ───────── CITIES (tabbed) ───────── */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Explore by location" title="Projects by city & locality" text="Pick a city to see its localities, project counts, starting prices and top projects." action={{ href: '/localities', label: 'All localities' }} />
          <CityExplorer data={buildCityExplorer()} />
        </div>
      </section>

      {/* ───────── STATUS ───────── */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading eyebrow="By project stage" title="New launches to ready-to-move homes" center />
          <StatusTabs items={statuses.flatMap((s) => properties.filter((p) => p.status === s.slug && p.listingFor === 'buy').sort((a, b) => Number(b.source === 'published') - Number(a.source === 'published')).slice(0, 8).map(toCard))} counts={Object.fromEntries(statuses.map((s) => [s.slug, properties.filter((p) => p.status === s.slug).length]))} />
        </div>
      </section>

      {/* ───────── PHONE SHOWCASE ───────── */}
      <PhoneShowcase featured={featured} />

      {/* ───────── NEWLY ADDED ───────── */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Fresh on RealtechX" title="Newly added properties" action={{ href: '/properties', label: 'See all listings' }} />
          <Carousel label="Newly added">
            {latest.map((p) => <PropertyCard key={p.id} p={toCard(p)} />)}
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
                <Link key={d.slug} href={`/developers/${d.slug}`} className="group flex flex-col items-center rounded-[20px] border border-ink/[0.07] bg-ivory/50 p-4 text-center transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-white hover:shadow-luxe md:flex-row md:gap-4 md:p-5 md:text-left">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink font-display text-lg font-semibold text-gold-light transition group-hover:bg-gold-grad group-hover:text-ink md:h-16 md:w-16 md:text-xl">
                    {d.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                  </span>
                  <span className="mt-3 min-w-0 md:mt-0">
                    <span className="line-clamp-2 text-[14px] font-semibold leading-snug group-hover:text-gold-dark md:text-[15px]">{d.name}</span>
                    <span className="mt-1 block text-[12px] text-muted">{count} {count === 1 ? 'project' : 'projects'} · {getCity(d.city)?.name}</span>
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

      {/* ───────── WHY US ───────── */}
      <section className="section bg-ink text-ivory">
        <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] sm:aspect-[16/10] lg:aspect-[5/6]">
            <ArtImage mobile={img.whyWide} desktop={img.why} breakpoint={1024} alt="Premium home exterior" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-ink/70 p-4 backdrop-blur-md md:bottom-6 md:left-6 md:right-6 md:p-5">
              <p className="font-display text-[18px] font-semibold md:text-[22px]">“We help you decide — not just discover.”</p>
              <p className="mt-1 text-xs text-ivory/60">The RealtechX promise</p>
            </div>
          </div>
          <div>
            <p className="eyebrow !text-gold-light">Why RealtechX</p>
            <h2 className="h-section mt-3">A calmer, clearer way to buy property</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ivory/65">Every listing is presented with complete pricing, configurations, amenities and location insights — so you spend less time chasing details and more time deciding.</p>
            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-7 md:mt-10">
              {[
                { Icon: BadgeCheck, t: 'Complete details', d: 'Prices, plans & possession on one page.' },
                { Icon: Handshake, t: 'Zero brokerage', d: 'Enquire and book visits at no cost.' },
                { Icon: LineChart, t: 'Market insight', d: 'Locality guides & investment analysis.' },
                { Icon: Landmark, t: 'Loan support', d: 'Compare offers, calculate EMI instantly.' },
              ].map(({ Icon, t, d }) => (
                <div key={t}>
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 md:h-12 md:w-12"><Icon className="h-5 w-5 text-gold" /></span>
                  <p className="mt-3 text-[15px] font-semibold md:mt-4">{t}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ivory/60 md:text-sm">{d}</p>
                </div>
              ))}
            </div>
            <LeadButton className="btn-gold mt-9 w-full sm:w-auto" intent="Talk to an Advisor" source="Home Why Us">Talk to an advisor <ArrowRight className="h-4 w-4" /></LeadButton>
          </div>
        </div>
      </section>

      {/* ───────── REVIEWS ───────── */}
      <Reviews />

      {/* ───────── SELL CTA ───────── */}
      <section className="pb-14 md:pb-24">
        <div className="container">
          <div className="relative isolate overflow-hidden rounded-[28px] bg-ink text-ivory md:rounded-[36px]">
            <Image src={img.villa[4]} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-40" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-ink/90 to-ink/50" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/25 blur-3xl" />
            <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-gold/20 md:inset-4 md:rounded-[28px]" />
            <div className="grid gap-9 p-7 sm:p-10 md:p-14 lg:grid-cols-[1.25fr_1fr] lg:items-center">
              <div>
                <p className="eyebrow !text-gold-light">For owners, builders & channel partners</p>
                <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.1] md:text-[46px]">Sell or rent out your property <span className="gold-text italic">faster</span></h2>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ivory/70">List on RealtechX and reach serious buyers and tenants searching every day — with a premium listing page your property deserves.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/sell" className="btn-gold">Post property free <ArrowRight className="h-4 w-4" /></Link>
                  <LeadButton className="btn-ghost-light" intent="Talk to Listing Team" source="Home Sell CTA" title="Talk to our listing team">Talk to our team</LeadButton>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { n: '₹0', t: 'Listing fee' },
                  { n: '24h', t: 'Listing goes live' },
                  { n: '10', t: 'Cities covered' },
                  { n: '1:1', t: 'Dedicated manager' },
                ].map((s) => (
                  <div key={s.t} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur md:p-6">
                    <p className="font-display text-[30px] font-semibold text-gold-light md:text-[38px]">{s.n}</p>
                    <p className="mt-1 text-[12.5px] text-ivory/65 md:text-sm">{s.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── POPULAR LOCALITIES (3 rows) ───────── */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading eyebrow="Where buyers are looking" title="Popular localities" action={{ href: '/localities', label: 'All localities' }} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {localities.map((l, i) => (
              <Link
                key={l.city + l.slug}
                href={`/city/${l.city}/${l.slug}`}
                className={`group items-center gap-3 rounded-2xl border border-ink/[0.07] bg-ivory/50 p-2.5 transition hover:-translate-y-0.5 hover:border-gold/40 hover:bg-white hover:shadow-card md:p-3 ${i >= 9 ? 'hidden lg:flex' : i >= 6 ? 'hidden md:flex' : 'flex'}`}
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl md:h-14 md:w-14">
                  <Image src={l.list[0].images[0]} alt="" fill sizes="56px" className="object-cover transition duration-500 group-hover:scale-110" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold group-hover:text-gold-dark">{l.name}</span>
                  <span className="flex items-center gap-1 truncate text-[12px] text-muted"><MapPin className="h-3 w-3 shrink-0" />{getCity(l.city)?.name}<span className="hidden sm:inline"> · {l.list.length} {l.list.length === 1 ? 'project' : 'projects'}</span></span>
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/localities" className="btn-outline">Explore all localities <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* ───────── BLOG ───────── */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Insights" title="From the RealtechX journal" action={{ href: '/blog', label: 'View all articles' }} />
          <Carousel label="Blog articles">
            {blogs.slice(0, 6).map((b) => <BlogCard key={b.slug} b={b} />)}
          </Carousel>
        </div>
      </section>
    </>
  );
}
