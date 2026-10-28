'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ExternalLink, Newspaper, Pencil, Trash2 } from 'lucide-react';
import { api, qs, when } from '@/components/admin/api';
import { AddButton, Badge, Empty, ErrorBox, IconButton, Loading, PageHeader, Pagination, SearchBox, Tabs, publishTone, useAdmin, useApi, type ListResult } from '@/components/admin/ui';
import { thumb } from '@/components/admin/media';

type B = { _id: string; slug: string; title: string; category: string; date: string; publish?: string; cover: string; author?: string; readTime?: string; updatedAt?: string };

export default function Page() {
  const { toast, confirm } = useAdmin();
  const [q, setQ] = useState('');
  const [publish, setPublish] = useState('');
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi<ListResult<B>>(`blogs${qs({ q, publish, page, limit: 20 })}`);
  const remove = async (b: B) => {
    if (!(await confirm({ title: `Delete “${b.title}”?`, confirm: 'Delete', danger: true }))) return;
    try {
      await api(`blogs/${encodeURIComponent(b._id)}`, { method: 'DELETE' });
      toast('Post deleted');
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };
  return (
    <div>
      <PageHeader eyebrow="Content" title="Blogs" subtitle="Guides and market insights — great for Google rankings." actions={<AddButton href="/admin/blogs/new">New post</AddButton>} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs value={publish} onChange={(v) => { setPublish(v); setPage(1); }} tabs={[{ value: '', label: 'All' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Drafts' }]} />
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search posts…" className="sm:ml-auto sm:w-72" />
      </div>
      {error ? (
        <ErrorBox error={error} retry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : !data?.items.length ? (
        <div className="a-card"><Empty icon={Newspaper} title="No posts yet" action={<AddButton href="/admin/blogs/new">Write the first post</AddButton>} /></div>
      ) : (
        <>
          <div className="a-card divide-y divide-ink/[0.05]">
            {data.items.map((b) => (
              <div key={b._id} className="flex items-center gap-4 px-4 py-3 transition hover:bg-ivory/50">
                <Link href={`/admin/blogs/${encodeURIComponent(b._id)}`} className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-ivory-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {b.cover && <img src={thumb(b.cover, 220)} alt="" className="h-full w-full object-cover" loading="lazy" />}
                </Link>
                <Link href={`/admin/blogs/${encodeURIComponent(b._id)}`} className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-[14.5px] font-semibold hover:text-gold-dark">{b.title}</span>
                  <span className="mt-0.5 block text-[12px] text-ink/50">{b.category} · {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {b.author ?? '—'}</span>
                  <span className="mt-1 flex items-center gap-2"><Badge tone={publishTone(b.publish)}>{b.publish ?? 'published'}</Badge><span className="text-[11px] text-ink/40">updated {when(b.updatedAt)}</span></span>
                </Link>
                <div className="flex shrink-0 gap-1">
                  {b.publish === 'published' && <a href={`/blog/${b.slug}`} target="_blank" rel="noopener" className="hidden h-9 w-9 place-items-center rounded-xl border border-ink/[0.08] bg-white text-ink/60 hover:text-gold-dark sm:grid" aria-label="View"><ExternalLink className="h-4 w-4" /></a>}
                  <Link href={`/admin/blogs/${encodeURIComponent(b._id)}`} className="grid h-9 w-9 place-items-center rounded-xl border border-ink/[0.08] bg-white text-ink/60 hover:text-gold-dark" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
                  <IconButton label="Delete" tone="danger" onClick={() => remove(b)}><Trash2 className="h-4 w-4" /></IconButton>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} label="posts" />
        </>
      )}
    </div>
  );
}
