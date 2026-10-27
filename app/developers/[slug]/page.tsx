import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { PageHero } from '@/components/ui';
import PropertyCard from '@/components/PropertyCard';
import LeadForm from '@/components/LeadForm';
import { developers, getDeveloper } from '@/lib/data/developers';
import { properties } from '@/lib/data/properties';
import { getCity } from '@/lib/data/cities';
import { titleCase } from '@/lib/format';

export function generateStaticParams() {
  return developers.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = getDeveloper(slug);
  if (!d) return {};
  return { title: `${d.name} — Projects, Profile & Reviews`, description: d.about.slice(0, 155), alternates: { canonical: `/developers/${slug}` } };
}

export default async function DeveloperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDeveloper(slug);
  if (!d) notFound();
  const list = properties.filter((p) => p.developer === d.slug);
  const city = getCity(d.city);
  const cityNames = Array.from(new Set(list.map((p) => getCity(p.city)?.name))).join(', ');
  const types = Array.from(new Set(list.map((p) => titleCase(p.type)))).join(', ');

  return (
    <>
      <PageHero eyebrow="Developer profile" title={d.name} text={d.tagline} image={d.cover} crumbs={[{ href: '/', label: 'Home' }, { href: '/developers', label: 'Developers' }, { label: d.name }]}>
        <div className="mt-8 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { k: 'Established', v: d.established },
            { k: 'Headquarters', v: city?.name },
            { k: 'Listed projects', v: list.length },
            { k: 'Experience', v: `${new Date().getFullYear() - d.established}+ yrs` },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-white/15 bg-white/5 p-3 backdrop-blur md:p-4">
              <p className="truncate font-display text-xl font-semibold text-gold-light md:text-2xl">{s.v}</p>
              <p className="text-[11px] uppercase tracking-wider text-ivory/60">{s.k}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="container grid gap-10 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="card p-5 md:p-9">
            <p className="eyebrow">About the developer</p>
            <h2 className="mt-3 font-display text-[26px] font-semibold md:text-3xl">{d.name}</h2>
            <p className="mt-4 leading-relaxed text-ink/75">{d.about}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {d.specialties.map((s) => (
                <p key={s} className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-gold-dark" />{s}</p>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted">Active in: {cityNames} · Categories: {types}</p>
          </div>

          <h2 className="mb-5 mt-10 font-display text-[24px] font-semibold md:mb-6 md:mt-12 md:text-3xl">Projects by {d.name} <span className="text-muted">({list.length})</span></h2>
          <div className="grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3">
            {list.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        </div>

        <aside>
          <div className="card sticky top-24 p-5 md:p-7">
            <p className="eyebrow">Enquire</p>
            <h3 className="mb-5 mt-2 font-display text-2xl font-semibold">Get details of all {d.name} projects</h3>
            <LeadForm source={`Developer: ${d.name}`} property={d.name} cta="Get Project Details" />
          </div>
        </aside>
      </section>
    </>
  );
}
