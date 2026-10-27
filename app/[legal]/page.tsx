import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/ui';
import { legalPages } from '@/lib/data/legal';
import { formatDate } from '@/lib/format';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(legalPages).map((legal) => ({ legal }));
}

export async function generateMetadata({ params }: { params: Promise<{ legal: string }> }): Promise<Metadata> {
  const { legal } = await params;
  const page = legalPages[legal];
  if (!page) return {};
  return { title: page.title, alternates: { canonical: `/${legal}` } };
}

export default async function LegalPage({ params }: { params: Promise<{ legal: string }> }) {
  const { legal } = await params;
  const page = legalPages[legal];
  if (!page) notFound();
  return (
    <>
      <PageHero eyebrow="Legal" title={page.title} text={`Last updated ${formatDate(page.updated)}`} crumbs={[{ href: '/', label: 'Home' }, { label: page.title }]} />
      <section className="container max-w-3xl py-14">
        <div className="card prose-luxe p-7 md:p-12">
          {page.sections.map((s) => (
            <div key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
