'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Pencil, Trash2, Inbox } from 'lucide-react';
import { api, qs } from './api';
import { AddButton, Counter, Drawer, Empty, ErrorBox, Field, IconButton, Loading, Pagination, SaveButton, SearchBox, TagInput, Toggle, useAdmin, useApi, type ListResult } from './ui';
import { ImageField } from './media';

export type FieldDef = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select' | 'toggle' | 'image' | 'logo' | 'tags' | 'email' | 'password' | 'seo' | 'readonly';
  options?: { value: string; label: string }[];
  hint?: React.ReactNode;
  required?: boolean;
  wide?: boolean;
  placeholder?: string;
  rows?: number;
  suggestions?: string[];
  folder?: string;
  /** hide unless predicate true */
  when?: (doc: any, isNew: boolean) => boolean;
};

export type Column = { label: string; className?: string; render: (row: any) => React.ReactNode; hideSm?: boolean };

const getIn = (o: any, k: string) => k.split('.').reduce((v, p) => (v == null ? v : v[p]), o);
const setIn = (o: any, k: string, val: any) => {
  const ks = k.split('.');
  const out = { ...o };
  let cur = out;
  ks.slice(0, -1).forEach((p) => {
    cur[p] = { ...(cur[p] ?? {}) };
    cur = cur[p];
  });
  cur[ks[ks.length - 1]] = val;
  return out;
};

export function FormFields({ fields, doc, onChange, isNew }: { fields: FieldDef[]; doc: any; onChange: (d: any) => void; isNew: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields
        .filter((f) => !f.when || f.when(doc, isNew))
        .map((f) => {
          const v = getIn(doc, f.key);
          const set = (val: any) => onChange(setIn(doc, f.key, val));
          const wide = f.wide || ['textarea', 'image', 'tags', 'seo', 'toggle'].includes(f.type ?? '');
          if (f.type === 'toggle') return <div key={f.key} className="sm:col-span-2"><Toggle checked={!!v} onChange={set} label={f.label} hint={f.hint} /></div>;
          if (f.type === 'seo')
            return (
              <details key={f.key} className="group rounded-2xl border border-ink/[0.08] bg-white sm:col-span-2">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[13px] font-semibold">SEO settings <span className="text-[11.5px] font-normal text-ink/45 group-open:hidden">optional</span></summary>
                <div className="grid gap-3 border-t border-ink/[0.06] p-4">
                  <Field label={<span className="flex justify-between">Meta title <Counter value={v?.title ?? ''} ideal={[30, 65]} /></span>}><input className="a-input" value={v?.title ?? ''} onChange={(e) => set({ ...v, title: e.target.value })} /></Field>
                  <Field label={<span className="flex justify-between">Meta description <Counter value={v?.description ?? ''} ideal={[70, 165]} /></span>}><textarea className="a-input min-h-[70px]" value={v?.description ?? ''} onChange={(e) => set({ ...v, description: e.target.value })} /></Field>
                  <Field label="Keywords"><input className="a-input" value={v?.keywords ?? ''} onChange={(e) => set({ ...v, keywords: e.target.value })} /></Field>
                  <Toggle checked={!!v?.noindex} onChange={(x) => set({ ...v, noindex: x })} label="Hide from Google (noindex)" />
                </div>
              </details>
            );
          return (
            <Field key={f.key} label={f.label} hint={f.hint} required={f.required} className={wide ? 'sm:col-span-2' : ''}>
              {f.type === 'textarea' ? (
                <textarea className="a-input" style={{ minHeight: `${(f.rows ?? 4) * 24 + 20}px` }} value={v ?? ''} onChange={(e) => set(e.target.value)} placeholder={f.placeholder} />
              ) : f.type === 'select' ? (
                <select className="a-input" value={v ?? ''} onChange={(e) => set(e.target.value)}>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === 'image' || f.type === 'logo' ? (
                <ImageField value={v ?? ''} onChange={set} folder={f.folder ?? 'general'} aspect={f.type === 'logo' ? 'aspect-[3/1] max-w-xs' : 'aspect-[16/9]'} contain={f.type === 'logo'} />
              ) : f.type === 'tags' ? (
                <TagInput value={Array.isArray(v) ? v : []} onChange={set} suggestions={f.suggestions} />
              ) : f.type === 'readonly' ? (
                <input className="a-input" value={v ?? ''} disabled />
              ) : (
                <input
                  className="a-input"
                  type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : f.type === 'password' ? 'password' : 'text'}
                  autoComplete={f.type === 'password' ? 'new-password' : undefined}
                  value={v ?? ''}
                  onChange={(e) => set(f.type === 'number' ? e.target.value.replace(/[^\d.]/g, '') : e.target.value)}
                  placeholder={f.placeholder}
                />
              )}
            </Field>
          );
        })}
    </div>
  );
}

/** List + drawer editor for simple collections. */
export default function Crud({
  resource,
  noun,
  fields,
  columns,
  defaults = {},
  filters = [],
  extraQuery = {},
  searchPlaceholder = 'Search…',
  canCreate = true,
  canDelete = true,
  editParam,
  limit = 25,
  rowTitle = (r) => r.name ?? r.label ?? r._id,
  toolbar,
  onSaved,
}: {
  resource: string;
  noun: string;
  fields: FieldDef[];
  columns: Column[];
  defaults?: Record<string, any>;
  filters?: { key: string; label: string; options: { value: string; label: string }[] }[];
  extraQuery?: Record<string, string>;
  searchPlaceholder?: string;
  canCreate?: boolean | ((row: any) => boolean);
  canDelete?: boolean | ((row: any) => boolean);
  editParam?: string | null;
  limit?: number;
  rowTitle?: (row: any) => string;
  toolbar?: React.ReactNode;
  onSaved?: () => void;
}) {
  const { toast, confirm } = useAdmin();
  const [q, setQ] = useState('');
  const [fv, setFv] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const extraKey = JSON.stringify(extraQuery);
  const list = useApi<ListResult<any>>(`${resource}${qs({ q, ...fv, ...extraQuery, page, limit })}`);

  useEffect(() => setPage(1), [q, fv, extraKey]);

  const open = async (row: any | null) => {
    if (!row) {
      setIsNew(true);
      setEditing({ ...defaults });
      return;
    }
    setIsNew(false);
    setEditing({ ...row });
    try {
      const { item } = await api<{ item: any }>(`${resource}/${encodeURIComponent(row._id)}`);
      setEditing(item);
    } catch {
      /* keep list row */
    }
  };

  useEffect(() => {
    if (!editParam) return;
    api<{ item: any }>(`${resource}/${encodeURIComponent(editParam)}`)
      .then(({ item }) => {
        setIsNew(false);
        setEditing(item);
      })
      .catch(() => {});
  }, [editParam, resource]);

  const save = async () => {
    setBusy(true);
    try {
      if (isNew) await api(resource, { body: editing });
      else await api(`${resource}/${encodeURIComponent(editing._id)}`, { method: 'PUT', body: editing });
      toast(isNew ? `${noun} added` : `${noun} saved`);
      setEditing(null);
      list.reload();
      onSaved?.();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not save', 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: any) => {
    if (!(await confirm({ title: `Delete “${rowTitle(row)}”?`, text: 'This cannot be undone.', confirm: 'Delete', danger: true }))) return;
    try {
      await api(`${resource}/${encodeURIComponent(row._id)}`, { method: 'DELETE' });
      toast(`${noun} deleted`);
      setEditing(null);
      list.reload();
      onSaved?.();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not delete', 'error');
    }
  };

  const items = list.data?.items ?? [];
  const deletable = (r: any) => (typeof canDelete === 'function' ? canDelete(r) : canDelete);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchBox value={q} onChange={setQ} placeholder={searchPlaceholder} className="flex-1" />
        {filters.map((f) => (
          <select key={f.key} className="a-input sm:w-52" value={fv[f.key] ?? ''} onChange={(e) => setFv((p) => ({ ...p, [f.key]: e.target.value }))}>
            <option value="">{f.label}</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        {toolbar}
        {canCreate !== false && <AddButton onClick={() => open(null)}>Add {noun.toLowerCase()}</AddButton>}
      </div>

      {list.error ? (
        <ErrorBox error={list.error} retry={list.reload} />
      ) : list.loading && !list.data ? (
        <Loading />
      ) : !items.length ? (
        <div className="a-card"><Empty icon={Inbox} title={`No ${noun.toLowerCase()} found`} text={q ? 'Try a different search.' : undefined} action={canCreate !== false ? <AddButton onClick={() => open(null)}>Add {noun.toLowerCase()}</AddButton> : undefined} /></div>
      ) : (
        <>
          <div className={`a-card overflow-hidden ${list.loading ? 'opacity-60' : ''}`}>
            <table className="w-full">
              <thead className="hidden border-b border-ink/[0.06] bg-ivory/50 sm:table-header-group">
                <tr>
                  {columns.map((c) => <th key={c.label} className={`a-th ${c.hideSm ? 'hidden md:table-cell' : ''} ${c.className ?? ''}`}>{c.label}</th>)}
                  <th className="a-th w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.05]">
                {items.map((r) => (
                  <tr key={r._id} className="cursor-pointer transition hover:bg-ivory/50" onClick={() => open(r)}>
                    {columns.map((c, i) => (
                      <td key={c.label} className={`a-td ${c.hideSm ? 'hidden md:table-cell' : ''} ${i > 0 && !c.hideSm ? 'hidden sm:table-cell' : ''} ${c.className ?? ''}`}>{c.render(r)}</td>
                    ))}
                    <td className="a-td" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <IconButton label="Edit" onClick={() => open(r)}><Pencil className="h-3.5 w-3.5" /></IconButton>
                        {deletable(r) && <IconButton label="Delete" tone="danger" onClick={() => remove(r)}><Trash2 className="h-3.5 w-3.5" /></IconButton>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={list.data!.page} pages={list.data!.pages} total={list.data!.total} onPage={setPage} label={noun.toLowerCase()} />
        </>
      )}

      {editing && (
        <Drawer
          onClose={() => setEditing(null)}
          title={isNew ? `New ${noun.toLowerCase()}` : rowTitle(editing)}
          subtitle={isNew ? undefined : `Edit ${noun.toLowerCase()}`}
          wide
          footer={
            <>
              {!isNew && deletable(editing) && <button onClick={() => remove(editing)} className="a-btn a-btn-danger mr-auto"><Trash2 className="h-4 w-4" /> Delete</button>}
              <button className="a-btn a-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <SaveButton busy={busy} onClick={save}>{isNew ? `Add ${noun.toLowerCase()}` : 'Save changes'}</SaveButton>
            </>
          }
        >
          <FormFields fields={fields} doc={editing} onChange={setEditing} isNew={isNew} />
        </Drawer>
      )}
    </div>
  );
}
