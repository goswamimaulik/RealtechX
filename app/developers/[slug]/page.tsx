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
            <div key={s.k} className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur">
              <p className="font-display text-2xl font-semibold text-gold-light">{s.v}</p>
              <p className="text-[11px] uppercase tracking-wider text-ivory/60">{s.k}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="container grid gap-10 py-14 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="card p-7 md:p-9">
            <p className="eyebrow">About the developer</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">{d.name}</h2>
            <p className="mt-4 leading-relaxed text-ink/75">{d.about}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {d.specialties.map((s) => (
                <p key={s} className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-gold-dark" />{s}</p>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted">Active in: {cityNames} · Categories: {types}</p>
          </div>

          <h2 className="mb-6 mt-12 font-display text-3xl font-semibold">Projects by {d.name} <span className="text-muted">({list.length})</span></h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {list.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        </div>

        <aside>
          <div className="card sticky top-24 p-7">
            <p className="eyebrow">Enquire</p>
            <h3 className="mb-5 mt-2 font-display text-2xl font-semibold">Get details of all {d.name} projects</h3>
            <LeadForm source={`Developer: ${d.name}`} property={d.name} cta="Get Project Details" />
          </div>
        </aside>
      </section>
    </>
  );
}
