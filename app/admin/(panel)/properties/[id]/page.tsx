import PropertyEditor from '@/components/admin/PropertyEditor';

export const metadata = { title: 'Edit listing' };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kind?: string }> }) {
  const { id } = await params;
  const { kind } = await searchParams;
  const isNew = id === 'new';
  return <PropertyEditor key={id} id={isNew ? null : decodeURIComponent(id)} initialKind={kind === 'project' ? 'project' : 'property'} />;
}
