'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarClock, Download, FileSpreadsheet, Globe, Inbox, Mail, MessageCircle, Phone, ShieldAlert, StickyNote, Trash2, UserRound } from 'lucide-react';
import { api, dateTime, download, qs, when } from '@/components/admin/api';
import { AddButton, Badge, Drawer, Empty, ErrorBox, Field, Loading, Modal, PageHeader, Pagination, SaveButton, SearchBox, Tabs, leadTone, useAdmin, useApi, type ListResult } from '@/components/admin/ui';

type Note = { at: string; by: string; text: string };
type Lead = {
  _id: string;
  leadId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  property?: string;
  propertySlug?: string;
  intent?: string;
  source: string;
  page?: string;
  status: string;
  assignedTo?: string;
  followUp?: string;
  notes: Note[];
  spam?: boolean;
  createdAt: string;
  updatedAt?: string;
};

const STATUSES = ['new', 'contacted', 'qualified', 'closed', 'lost'] as const;
const today = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
const waLink = (phone: string, name: string, property?: string) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${name}, thank you for your enquiry${property ? ` about ${property}` : ''}.`)}`;

export default function LeadsView() {
  const sp = useSearchParams();
  const { toast, confirm } = useAdmin();
  const [status, setStatus] = useState(sp.get('status') ?? '');
  const [spam, setSpam] = useState(false);
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [property, setProperty] = useState('');
  const [assignedTo, setAssigned] = useState('');
  const [followup, setFollowup] = useState(sp.get('followup') === 'due');
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(sp.get('open'));
  const [adding, setAdding] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const users = useApi<{ users: { id: string; name: string; role: string }[] }>('options').data?.users ?? [];
  const userName = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u.name])), [users]);

  const filters = { q, from, to, property, assignedTo, followup: followup ? 'due' : '', spam: spam ? '1' : '' };
  const list = useApi<ListResult<Lead>>(`leads${qs({ ...filters, status, page, limit: 25 })}`);
  const fk = JSON.stringify(filters);

  useEffect(() => {
    let live = true;
    Promise.all(['', ...STATUSES].map((s) => api<ListResult<Lead>>(`leads${qs({ ...filters, spam: '', status: s, limit: 1 })}`).then((r) => [s || 'all', r.total] as const)))
      .then((r) => live && setCounts(Object.fromEntries(r)))
      .catch(() => {});
    api<ListResult<Lead>>(`leads${qs({ ...filters, spam: '1', status: '', limit: 1 })}`).then((r) => live && setCounts((c) => ({ ...c, spam: r.total }))).catch(() => {});
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fk, list.data]);

  useEffect(() => {
    setPage(1);
    setSel([]);
  }, [status, spam, q, from, to, property, assignedTo, followup]);

  const items = list.data?.items ?? [];
  const allSel = items.length > 0 && items.every((i) => sel.includes(i._id));
  const exportHref = (format: 'csv' | 'xls', ids?: string[]) => `/api/admin/export/leads${qs({ ...filters, status, format, ids: ids?.join(',') })}`;

  const quickUpdate = async (l: Lead, patch: Partial<Lead> & { note?: string }) => {
    try {
      await api(`leads/${encodeURIComponent(l._id)}`, { method: 'PUT', body: patch });
      list.reload();
      toast('Lead updated');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  const bulk = async (action: string, value?: string) => {
    if (action === 'delete' && !(await confirm({ title: `Delete ${sel.length} lead${sel.length === 1 ? '' : 's'}?`, text: 'Deleted leads cannot be recovered. Tip: export them first.', confirm: 'Delete', danger: true }))) return;
    try {
      const r = await api<{ done: number }>('leads/bulk', { body: { ids: sel, action, value } });
      toast(`${r.done} lead${r.done === 1 ? '' : 's'} updated`);
      setSel([]);
      list.reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Leads & Enquiries"
        subtitle="Every form on the website lands here — call, follow up, take notes and track each lead to closure."
        actions={
          <>
            <button className="a-btn a-btn-ghost" onClick={() => download(exportHref('csv'))}><Download className="h-4 w-4" /> CSV</button>
            <button className="a-btn a-btn-ghost" onClick={() => download(exportHref('xls'))}><FileSpreadsheet className="h-4 w-4" /> Excel</button>
            <AddButton onClick={() => setAdding(true)}>Add lead</AddButton>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Tabs
          value={spam ? 'spam' : status}
          onChange={(v) => {
            if (v === 'spam') {
              setSpam(true);
              setStatus('');
            } else {
              setSpam(false);
              setStatus(v);
            }
          }}
          tabs={[
            { value: '', label: 'All', count: counts.all },
            ...STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1), count: counts[s] })),
            { value: 'spam', label: <><ShieldAlert className="h-3.5 w-3.5" /> Spam</>, count: counts.spam },
          ]}
        />
        <button onClick={() => setFollowup((f) => !f)} className={`chip self-start ${followup ? 'chip-active' : ''}`}><CalendarClock className="h-3.5 w-3.5" /> Follow-ups due</button>
      </div>

      <div className="a-card mb-4 grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
        <SearchBox value={q} onChange={setQ} placeholder="Name, phone, email, lead ID…" className="sm:col-span-2 lg:col-span-1" />
        <input className="a-input" value={property} onChange={(e) => setProperty(e.target.value)} placeholder="Property / project" />
        <input className="a-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
        <input className="a-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
        <select className="a-input" value={assignedTo} onChange={(e) => setAssigned(e.target.value)}>
          <option value="">Anyone</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {sel.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-ink px-3.5 py-2.5 text-[12.5px] text-ivory">
          <b>{sel.length} selected</b>
          <select className="rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-[12.5px]" value="" onChange={(e) => e.target.value && bulk('status', e.target.value)}>
            <option value="">Set status…</option>
            {STATUSES.map((s) => <option key={s} value={s} className="text-ink">{s}</option>)}
          </select>
          <select className="rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-[12.5px]" value="" onChange={(e) => e.target.value && bulk('assign', e.target.value === '-' ? '' : e.target.value)}>
            <option value="">Assign to…</option>
            <option value="-" className="text-ink">Unassigned</option>
            {users.map((u) => <option key={u.id} value={u.id} className="text-ink">{u.name}</option>)}
          </select>
          <button className="font-semibold text-gold-light hover:underline" onClick={() => download(exportHref('csv', sel))}>Export</button>
          <button className="font-semibold text-ivory/80 hover:underline" onClick={() => bulk(spam ? 'notspam' : 'spam')}>{spam ? 'Not spam' : 'Mark spam'}</button>
          <button className="font-semibold text-rose-300 hover:underline" onClick={() => bulk('delete')}>Delete</button>
          <button className="text-ivory/50 hover:text-ivory" onClick={() => setSel([])}>Clear</button>
        </div>
      )}

      {list.error ? (
        <ErrorBox error={list.error} retry={list.reload} />
      ) : list.loading && !list.data ? (
        <Loading />
      ) : !items.length ? (
        <div className="a-card"><Empty icon={Inbox} title={spam ? 'No spam — nice!' : 'No leads match'} text={spam ? 'Suspicious submissions (bots, link spam) are moved here automatically.' : 'New enquiries from every form on the website show up here instantly.'} /></div>
      ) : (
        <>
          <div className={`a-card hidden overflow-x-auto lg:block ${list.loading ? 'opacity-60' : ''}`}>
            <table className="w-full">
              <thead className="border-b border-ink/[0.06] bg-ivory/50">
                <tr>
                  <th className="a-th w-10"><input type="checkbox" aria-label="Select all" checked={allSel} onChange={() => setSel(allSel ? [] : items.map((i) => i._id))} className="h-4 w-4 accent-[#C9A45C]" /></th>
                  <th className="a-th">Lead</th>
                  <th className="a-th">Property / source</th>
                  <th className="a-th">Received</th>
                  <th className="a-th">Status</th>
                  <th className="a-th">Assigned</th>
                  <th className="a-th">Follow-up</th>
                  <th className="a-th" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.05]">
                {items.map((l) => (
                  <tr key={l._id} className={`transition hover:bg-ivory/50 ${sel.includes(l._id) ? 'bg-gold-50/50' : ''}`}>
                    <td className="a-td"><input type="checkbox" aria-label={`Select ${l.name}`} checked={sel.includes(l._id)} onChange={() => setSel((s) => (s.includes(l._id) ? s.filter((x) => x !== l._id) : [...s, l._id]))} className="h-4 w-4 accent-[#C9A45C]" /></td>
                    <td className="a-td">
                      <button onClick={() => setOpen(l._id)} className="text-left">
                        <span className="block font-semibold hover:text-gold-dark">{l.name}</span>
                        <span className="block text-[12px] text-ink/50">{l.leadId} · {l.phone}</span>
                      </button>
                    </td>
                    <td className="a-td max-w-[260px]">
                      <span className="block truncate">{l.property || l.intent || '—'}</span>
                      <span className="block truncate text-[12px] text-ink/45">{l.source}</span>
                    </td>
                    <td className="a-td whitespace-nowrap text-[12.5px] text-ink/60" title={dateTime(l.createdAt)}>{when(l.createdAt)}</td>
                    <td className="a-td">
                      <select value={l.status} onChange={(e) => quickUpdate(l, { status: e.target.value })} className={`cursor-pointer rounded-full border-0 py-1 pl-2.5 pr-2 text-[11.5px] font-semibold capitalize outline-none ring-1 ${({ new: 'bg-sky-50 text-sky-700 ring-sky-200', contacted: 'bg-amber-50 text-amber-700 ring-amber-200', qualified: 'bg-violet-50 text-violet-700 ring-violet-200', closed: 'bg-emerald-50 text-emerald-700 ring-emerald-200', lost: 'bg-rose-50 text-rose-700 ring-rose-200' } as Record<string, string>)[l.status] ?? ''}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="a-td text-[12.5px] text-ink/65">{userName[l.assignedTo ?? ''] ?? <span className="text-ink/35">—</span>}</td>
                    <td className="a-td text-[12.5px]">{l.followUp ? <span className={l.followUp <= today() && !['closed', 'lost'].includes(l.status) ? 'font-semibold text-rose-600' : 'text-ink/65'}>{new Date(l.followUp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> : <span className="text-ink/35">—</span>}</td>
                    <td className="a-td">
                      <div className="flex justify-end gap-1">
                        <a href={`tel:${l.phone.replace(/\s/g, '')}`} aria-label="Call" className="grid h-8 w-8 place-items-center rounded-lg text-ink/55 hover:bg-ivory hover:text-ink"><Phone className="h-4 w-4" /></a>
                        <a href={waLink(l.phone, l.name, l.property)} target="_blank" rel="noopener" aria-label="WhatsApp" className="grid h-8 w-8 place-items-center rounded-lg text-ink/55 hover:bg-emerald-50 hover:text-emerald-700"><MessageCircle className="h-4 w-4" /></a>
                        {l.email && <a href={`mailto:${l.email}`} aria-label="Email" className="grid h-8 w-8 place-items-center rounded-lg text-ink/55 hover:bg-ivory hover:text-ink"><Mail className="h-4 w-4" /></a>}
                        <button onClick={() => setOpen(l._id)} className="a-btn a-btn-ghost a-btn-sm ml-1">Open</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2.5 lg:hidden">
            {items.map((l) => (
              <div key={l._id} className={`a-card p-4 ${sel.includes(l._id) ? 'ring-2 ring-gold/40' : ''}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" aria-label={`Select ${l.name}`} checked={sel.includes(l._id)} onChange={() => setSel((s) => (s.includes(l._id) ? s.filter((x) => x !== l._id) : [...s, l._id]))} className="mt-1 h-4 w-4 accent-[#C9A45C]" />
                  <button onClick={() => setOpen(l._id)} className="min-w-0 flex-1 text-left">
                    <span className="flex items-center justify-between gap-2"><span className="truncate text-[15px] font-semibold">{l.name}</span><Badge tone={leadTone(l.status)}>{l.status}</Badge></span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-ink/55">{l.property || l.source}</span>
                    <span className="mt-0.5 block text-[11.5px] text-ink/40">{l.leadId} · {when(l.createdAt)}{l.followUp ? ` · follow-up ${l.followUp}` : ''}</span>
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <a href={`tel:${l.phone.replace(/\s/g, '')}`} className="a-btn a-btn-ink a-btn-sm"><Phone className="h-3.5 w-3.5" /> Call</a>
                  <a href={waLink(l.phone, l.name, l.property)} target="_blank" rel="noopener" className="a-btn a-btn-sm border border-emerald-200 bg-emerald-50 text-emerald-700"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
                  <button onClick={() => setOpen(l._id)} className="a-btn a-btn-ghost a-btn-sm">Details</button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={list.data!.page} pages={list.data!.pages} total={list.data!.total} onPage={setPage} label="leads" />
        </>
      )}

      {open && <LeadDrawer id={open} users={users} onClose={() => setOpen(null)} onChanged={list.reload} />}
      {adding && <AddLead onClose={() => setAdding(false)} onSaved={() => { setAdding(false); list.reload(); }} />}
    </div>
  );
}

function LeadDrawer({ id, users, onClose, onChanged }: { id: string; users: { id: string; name: string }[]; onClose: () => void; onChanged: () => void }) {
  const { toast, confirm } = useAdmin();
  const { data, error, loading, setData } = useApi<{ item: Lead }>(`leads/${encodeURIComponent(id)}`);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const l = data?.item;

  const update = useCallback(
    async (patch: Record<string, unknown>, msg = 'Saved') => {
      setBusy(true);
      try {
        const r = await api<{ item: Lead }>(`leads/${encodeURIComponent(id)}`, { method: 'PUT', body: patch });
        setData({ item: r.item });
        onChanged();
        toast(msg);
        return true;
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Failed', 'error');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [id, onChanged, setData, toast],
  );

  const remove = async () => {
    if (!(await confirm({ title: 'Delete this lead?', text: 'This cannot be undone.', confirm: 'Delete', danger: true }))) return;
    try {
      await api(`leads/${encodeURIComponent(id)}`, { method: 'DELETE' });
      toast('Lead deleted');
      onChanged();
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  return (
    <Drawer
      onClose={onClose}
      title={l?.name ?? 'Lead'}
      subtitle={l ? <span>{l.leadId} · received {dateTime(l.createdAt)}</span> : undefined}
      footer={
        l && (
          <>
            <button onClick={remove} className="a-btn a-btn-danger mr-auto"><Trash2 className="h-4 w-4" /> Delete</button>
            <button onClick={() => update({ spam: !l.spam }, l.spam ? 'Moved back to leads' : 'Marked as spam')} className="a-btn a-btn-ghost"><ShieldAlert className="h-4 w-4" /> {l.spam ? 'Not spam' : 'Spam'}</button>
          </>
        )
      }
    >
      {error ? (
        <ErrorBox error={error} />
      ) : loading || !l ? (
        <Loading rows={5} />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <a href={`tel:${l.phone.replace(/\s/g, '')}`} className="a-btn a-btn-ink"><Phone className="h-4 w-4" /> Call</a>
            <a href={waLink(l.phone, l.name, l.property)} target="_blank" rel="noopener" className="a-btn border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
            {l.email ? <a href={`mailto:${l.email}?subject=${encodeURIComponent(`Your enquiry${l.property ? ` — ${l.property}` : ''}`)}`} className="a-btn a-btn-ghost"><Mail className="h-4 w-4" /> Email</a> : <span className="a-btn a-btn-ghost pointer-events-none opacity-40"><Mail className="h-4 w-4" /> Email</span>}
          </div>

          <div className="a-card divide-y divide-ink/[0.05]">
            {[
              ['Phone', l.phone],
              ['Email', l.email || '—'],
              ['Property / project', l.propertySlug ? <a key="p" href={`/property/${l.propertySlug}`} target="_blank" rel="noopener" className="font-semibold text-gold-dark hover:underline">{l.property || l.propertySlug}</a> : l.property || '—'],
              ['Intent', l.intent || '—'],
              ['Source', l.source],
              ['Page', l.page ? <a key="pg" href={l.page} target="_blank" rel="noopener" className="inline-flex items-center gap-1 break-all text-gold-dark hover:underline"><Globe className="h-3.5 w-3.5 shrink-0" />{l.page.replace(/^https?:\/\/[^/]+/, '') || '/'}</a> : '—'],
            ].map(([k, v]) => (
              <div key={String(k)} className="grid grid-cols-[110px_1fr] gap-3 px-4 py-2.5 text-[13px]">
                <span className="text-ink/50">{k}</span>
                <span className="min-w-0 break-words">{v}</span>
              </div>
            ))}
          </div>

          {l.message && (
            <div>
              <p className="a-label">Message</p>
              <p className="whitespace-pre-wrap rounded-2xl border border-ink/[0.07] bg-white p-4 text-[13.5px] leading-relaxed">{l.message}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Status">
              <select className="a-input capitalize" value={l.status} disabled={busy} onChange={(e) => update({ status: e.target.value }, 'Status updated')}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Assigned to">
              <select className="a-input" value={l.assignedTo ?? ''} disabled={busy} onChange={(e) => update({ assignedTo: e.target.value }, 'Lead assigned')}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Field>
            <Field label="Follow-up date">
              <input type="date" className="a-input" value={l.followUp ?? ''} disabled={busy} onChange={(e) => update({ followUp: e.target.value }, e.target.value ? 'Reminder set' : 'Reminder cleared')} />
            </Field>
          </div>

          <div>
            <p className="a-label flex items-center gap-1.5"><StickyNote className="h-3.5 w-3.5" /> Notes & activity</p>
            <div className="rounded-2xl border border-ink/[0.07] bg-white p-3">
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note — call summary, budget, preferred visit date…" className="a-input min-h-[80px]" />
              <div className="mt-2 flex justify-end">
                <SaveButton busy={busy} onClick={async () => { if (note.trim() && (await update({ note }, 'Note added'))) setNote(''); }}>Add note</SaveButton>
              </div>
            </div>
            <ol className="mt-4 space-y-3 border-l-2 border-gold/30 pl-4">
              {[...(l.notes ?? [])].reverse().map((n, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-gold ring-4 ring-ivory" />
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">{n.text}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-ink/45"><UserRound className="h-3 w-3" />{n.by} · {dateTime(n.at)}</p>
                </li>
              ))}
              <li className="relative">
                <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-ink/30 ring-4 ring-ivory" />
                <p className="text-[13px] text-ink/60">Enquiry received via {l.source}</p>
                <p className="text-[11.5px] text-ink/40">{dateTime(l.createdAt)}</p>
              </li>
            </ol>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function AddLead({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { toast } = useAdmin();
  const [f, setF] = useState({ name: '', phone: '', email: '', property: '', source: 'Phone call', message: '', note: '' });
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await api('leads', { body: f });
      toast('Lead added');
      onSaved();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal onClose={onClose} title="Add a lead manually">
      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <Field label="Name" required><input className="a-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoFocus /></Field>
        <Field label="Phone" required><input className="a-input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91 98765 43210" /></Field>
        <Field label="Email"><input className="a-input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Source">
          <select className="a-input" value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })}>
            {['Phone call', 'Walk-in', 'WhatsApp', 'Referral', 'Channel partner', 'Social media', 'Other'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Property / project" className="sm:col-span-2"><input className="a-input" value={f.property} onChange={(e) => setF({ ...f, property: e.target.value })} /></Field>
        <Field label="Requirement" className="sm:col-span-2"><textarea className="a-input min-h-[80px]" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field>
        <Field label="First note" className="sm:col-span-2"><input className="a-input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Optional" /></Field>
      </div>
      <div className="flex justify-end gap-2 border-t border-ink/[0.07] px-5 py-3.5 sm:px-6">
        <button className="a-btn a-btn-ghost" onClick={onClose}>Cancel</button>
        <SaveButton busy={busy} onClick={save}>Add lead</SaveButton>
      </div>
    </Modal>
  );
}
