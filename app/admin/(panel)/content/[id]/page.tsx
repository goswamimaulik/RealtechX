import ContentEditor from './ContentEditor';

export const metadata = { title: 'Edit page' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContentEditor key={id} id={decodeURIComponent(id)} />;
}
