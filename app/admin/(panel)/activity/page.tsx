'use client';

import { useState } from 'react';
import { History } from 'lucide-react';
import { dateTime, qs } from '@/components/admin/api';
import { Badge, Empty, ErrorBox, Loading, PageHeader, Pagination, SearchBox, useApi, type ListResult, type Tone } from '@/components/admin/ui';

type A = { _id: string; at: string; userName: string; action: string; entity: string; entityId: string; summary: string; ip?: string };
const tone = (a: string): Tone => (a.includes('delete') ? 'red' : a.includes('create') ? 'green' : a.includes('login_failed') ? 'amber' : a.startsWith('login') ? 'blue' : a.includes('backup') || a.includes('password') ? 'violet' : 'gray');

export default function Page() {
  const [q, setQ] = useState('');
  const [entity, setEntity] = useState('');
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi<ListResult<A>>(`activity${qs({ q, entity, page, limit: 40 })}`);
  return (
    <div>
      <PageHeader eyebrow="System" title="Activity Log" subtitle="Who changed what, and when — including logins and failed login attempts." />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search user, action, item…" className="flex-1" />
        <select className="a-input sm:w-56" value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }}>
          <option value="">Everything</option>
          {['property', 'lead', 'developer', 'city', 'locality', 'state', 'term', 'blog post', 'content', 'SEO entry', 'media', 'user', 'settings', 'auth', 'backup'].map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>
      {error ? (
        <ErrorBox error={error} retry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : !data?.items.length ? (
        <div className="a-card"><Empty icon={History} title="Nothing logged yet" /></div>
      ) : (
        <>
          <div className="a-card divide-y divide-ink/[0.05]">
            {data.items.map((a) => (
              <div key={a._id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                <span className="w-44 shrink-0 text-[12px] text-ink/50">{dateTime(a.at)}</span>
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-[13.5px]">
                  <b>{a.userName}</b>
                  <Badge tone={tone(a.action)}>{a.action.replace(/_/g, ' ')}</Badge>
                  <span className="text-ink/55">{a.entity}</span>
                  {a.summary && <span className="min-w-0 truncate text-ink/75">· {a.summary}</span>}
                </span>
                {a.ip && <span className="shrink-0 font-mono text-[11px] text-ink/35">{a.ip}</span>}
              </div>
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} label="events" />
        </>
      )}
    </div>
  );
}
