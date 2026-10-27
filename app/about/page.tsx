import type { Metadata } from 'next';
import Image from '@/components/SmartImage';
import { Compass, Eye, Gem, ShieldCheck } from 'lucide-react';
import { Faq, PageHero, SectionHeading } from '@/components/ui';
import { LeadButton } from '@/components/LeadButtons';
import { img } from '@/lib/data/images';
import { properties, allLocalities } from '@/lib/data/properties';
import { cities } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';

export const metadata: Metadata = {
  title: 'About RealtechX — Premium Real Estate Portal',
  description: 'RealtechX is a premium real estate portal built to make property discovery clear, fast and trustworthy across India’s top cities.',
  alternates: { canonical: '/about' },
};

const faqs = [
  { q: 'What is RealtechX?', a: 'RealtechX is a premium real estate portal for discovering residential apartments, commercial spaces, plots, land and luxury villas — for sale and rent — across Mumbai, Pune, Bangalore, Hyderabad, Ahmedabad and Surat.' },
  { q: 'Does RealtechX charge buyers any brokerage?', a: 'No. Searching, shortlisting, enquiring and booking site visits through RealtechX is free for buyers and tenants.' },
  { q: 'Are the listings on RealtechX RERA verified?', a: 'RealtechX is currently a preview portal and listings are sample projects for demonstration. Always verify any project on the respective state RERA website before booking.' },
  { q: 'Which cities does RealtechX cover?', a: `We currently cover ${cities.map((c) => c.name).join(', ')}, and are adding new cities and localities every month.` },
  { q: 'I am a developer or channel partner — can I list my projects?', a: 'Yes. Use the Post Property page or contact our team. We create premium project pages with complete pricing, floor plans and lead capture.' },
  { q: 'How does RealtechX handle my personal data?', a: 'Your details are used only to respond to your enquiry and share relevant property information. Read our Privacy Policy for the full details.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title="Real estate, presented the way it deserves" text="RealtechX brings premium design, complete information and genuine advice to property discovery in India." image={img.villa[1]} crumbs={[{ href: '/', label: 'Home' }, { label: 'About' }]} />

      <section className="section">
        <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Our story</p>
            <h2 className="h-section mt-3">Built for buyers who value clarity</h2>
            <div className="prose-luxe mt-6">
              <p>Searching for property in India often means incomplete listings, hidden prices and endless follow-up calls. RealtechX was created to change that — with a portal where every project is presented with full pricing, configurations, amenities and location insights on a single, beautiful page.</p>
              <p>We cover residential apartments, commercial spaces, plots, land and luxury villas across six of India’s fastest-growing cities, and we are expanding city by city.</p>
              <p>Behind the portal is a team that understands real estate websites, search and lead management — so developers and channel partners get qualified enquiries, and buyers get answers.</p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={img.apartment[7]} alt="Premium living room" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="relative overflow-hidden bg-ink py-14 text-ivory md:py-20">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="container relative">
          <p className="eyebrow !text-gold-light">RealtechX in numbers</p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {[
              { n: properties.length + '+', l: 'Curated listings' },
              { n: cities.length, l: 'Cities covered' },
              { n: allLocalities().length, l: 'Localities' },
              { n: developers.length, l: 'Developer partners' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-7">
                <p className="font-display text-4xl font-semibold text-gold-light md:text-5xl">{s.n}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ivory/60">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="What drives us" title="Our values" center />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {[
              { Icon: Eye, t: 'Transparency', d: 'Complete details, upfront. No hidden surprises.' },
              { Icon: Gem, t: 'Premium experience', d: 'Design and speed that respect your time.' },
              { Icon: ShieldCheck, t: 'Responsibility', d: 'We encourage every buyer to verify on RERA.' },
              { Icon: Compass, t: 'Guidance', d: 'Advisors who help you decide, not just discover.' },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="card p-5 text-center md:p-7">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gold-50 md:h-14 md:w-14"><Icon className="h-6 w-6 text-gold-dark" /></span>
                <p className="mt-4 font-display text-lg font-semibold md:text-2xl">{t}</p>
                <p className="mt-2 text-[13px] text-muted md:text-sm">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="h-section mt-3">Questions about RealtechX</h2>
            <p className="mt-4 text-[15px] text-ink/65">Everything you need to know about how the portal works. Can’t find your answer? Our team is a message away.</p>
            <LeadButton className="btn-gold mt-7" intent="Ask a Question" source="About FAQ">Ask a question</LeadButton>
          </div>
          <Faq items={faqs} />
        </div>
      </section>
    </>
  );
}
