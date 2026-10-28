import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { getStore } from '@/lib/server/store';
import { pageMeta } from '@/lib/server/seo';

export async function generateMetadata({ params }: { params: Promise<{ legal: string }> }): Promise<Metadata> {
  const { legal } = await params;
  const s = await getStore();
  const page = s.legal[legal];
  if (!page) return {};
  return pageMeta(`/${legal}`, { title: page.title, description: `${page.title} of ${s.settings.name}.` });
}

export default async function LegalPage({ params }: { params: Promise<{ legal: string }> }) {
  const { legal } = await params;
  const s = await getStore();
  const page = s.legal[legal];
  if (!page) notFound();
  return (
    <>
      <PageHero eyebrow="Legal" title={page.title} text={`Last updated ${formatDate(page.updated)}`} crumbs={[{ href: '/', label: 'Home' }, { label: page.title }]} />
      <section className="container max-w-3xl py-14">
        <div className="card prose-luxe p-7 md:p-12">
          {page.sections.map((sec, i) => (
            <div key={sec.h + i}>
              <h2>{sec.h}</h2>
              {sec.p.map((p, j) => <p key={j}>{p}</p>)}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
