import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArchivePage from '@/components/ArchivePage';
import { filterProperties } from '@/lib/data/properties';
import { statuses } from '@/lib/site';
import { img } from '@/lib/data/images';

const text: Record<string, string> = {
  'new-launch': 'Be among the first to book at launch pricing with the best choice of units.',
  'under-construction': 'Flexible construction-linked payment plans with possession in the coming years.',
  'ready-to-move': 'Move in immediately — no waiting, no construction risk.',
};

export function generateStaticParams() {
  return statuses.map((s) => ({ status: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ status: string }> }): Promise<Metadata> {
  const { status } = await params;
  const s = statuses.find((x) => x.slug === status);
  if (!s) return {};
  return { title: `${s.label} Projects`, description: text[status], alternates: { canonical: `/status/${status}` } };
}

export default async function StatusPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  const s = statuses.find((x) => x.slug === status);
  if (!s) notFound();
  return (
    <ArchivePage
      eyebrow="Project status"
      title={`${s.label} projects`}
      text={text[status]}
      image={status === 'ready-to-move' ? img.apartment[6] : status === 'new-launch' ? img.apartment[1] : img.apartment[2]}
      crumbs={[{ href: '/', label: 'Home' }, { href: '/properties', label: 'Properties' }, { label: s.label }]}
      items={filterProperties({ status })}
      hide={['status']}
      related={{ title: 'Other stages', links: statuses.filter((x) => x.slug !== status).map((x) => ({ href: `/status/${x.slug}`, label: x.label })) }}
    />
  );
}
