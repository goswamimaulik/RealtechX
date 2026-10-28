import BlogEditor from './BlogEditor';

export const metadata = { title: 'Edit post' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogEditor key={id} id={id === 'new' ? null : decodeURIComponent(id)} />;
}
