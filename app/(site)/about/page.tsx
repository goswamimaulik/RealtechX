import Image from '@/components/SmartImage';
import { Compass, Eye, Gem, ShieldCheck } from 'lucide-react';
import { Faq, PageHero, SectionHeading } from '@/components/ui';
import { LeadButton } from '@/components/LeadButtons';
import { getStore, allLocalitiesIn } from '@/lib/server/store';
import { pageMeta } from '@/lib/server/seo';

export const generateMetadata = () =>
  pageMeta('/about', {
    title: 'About Us — Premium Real Estate Portal',
    description: 'A premium real estate portal built to make property discovery clear, fast and trustworthy across India’s top cities.',
  });

const icons = [Eye, Gem, ShieldCheck, Compass];

export default async function AboutPage() {
  const s = await getStore();
  const a = s.about;
  const name = s.settings.name;
  return (
    <>
      <PageHero eyebrow="About us" title={a.heroTitle} text={a.heroText} image={a.heroImage} crumbs={[{ href: '/', label: 'Home' }, { label: 'About' }]} />

      <section className="section">
        <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Our story</p>
            <h2 className="h-section mt-3">{a.storyTitle}</h2>
            <div className="prose-luxe mt-6">
              {a.story.map((t, i) => <p key={i}>{t}</p>)}
            </div>
          </div>
          {a.image && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src={a.image} alt={a.storyTitle} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* Numbers — always live from the database */}
      <section className="relative overflow-hidden bg-ink py-14 text-ivory md:py-20">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="container relative">
          <p className="eyebrow !text-gold-light">{name} in numbers</p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {[
              { n: s.properties.length + '+', l: 'Curated listings' },
              { n: s.cities.length, l: 'Cities covered' },
              { n: allLocalitiesIn(s).length, l: 'Localities' },
              { n: s.developers.length, l: 'Developers' },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-7">
                <p className="font-display text-4xl font-semibold text-gold-light md:text-5xl">{x.n}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ivory/60">{x.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {a.values.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading eyebrow="What drives us" title="Our values" center />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
              {a.values.map((v, i) => {
                const Icon = icons[i % icons.length];
                return (
                  <div key={v.title + i} className="card p-5 text-center md:p-7">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gold-50 md:h-14 md:w-14"><Icon className="h-6 w-6 text-gold-dark" /></span>
                    <p className="mt-4 font-display text-lg font-semibold md:text-2xl">{v.title}</p>
                    <p className="mt-2 text-[13px] text-muted md:text-sm">{v.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {a.faqs.length > 0 && (
        <section className="section bg-white">
          <div className="container grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 className="h-section mt-3">Questions about {name}</h2>
              <p className="mt-4 text-[15px] text-ink/65">Everything you need to know about how the portal works. Can’t find your answer? Our team is a message away.</p>
              <LeadButton className="btn-gold mt-7" intent="Ask a Question" source="About FAQ">Ask a question</LeadButton>
            </div>
            <Faq items={a.faqs} />
          </div>
        </section>
      )}
    </>
  );
}
