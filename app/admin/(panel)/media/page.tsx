'use client';

import { useState } from 'react';
import { Copy, ExternalLink, FileText, Film, ImagePlus, Trash2 } from 'lucide-react';
import { api, qs, when } from '@/components/admin/api';
import { Drawer, Empty, ErrorBox, Field, PageHeader, Pagination, SaveButton, SearchBox, Tabs, useAdmin, useApi, type ListResult } from '@/components/admin/ui';
import { Dropzone, MEDIA_FOLDERS, isImage, thumb, type Media } from '@/components/admin/media';

const size = (b?: number) => (!b ? '' : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export default function Page() {
  const { toast, confirm } = useAdmin();
  const [folder, setFolder] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [upFolder, setUpFolder] = useState('general');
  const [showUpload, setShowUpload] = useState(false);
  const [link, setLink] = useState('');
  const [open, setOpen] = useState<Media | null>(null);
  const [busy, setBusy] = useState(false);
  const list = useApi<ListResult<Media>>(`media${qs({ q, folder, page, limit: 48 })}`);

  const addLink = async () => {
    try {
      await api('media', { body: { url: link.trim(), folder: upFolder, resourceType: isImage(link) ? 'image' : 'raw' } });
      setLink('');
      toast('Link added to library');
      list.reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };
  const save = async () => {
    if (!open) return;
    setBusy(true);
    try {
      await api(`media/${open._id}`, { method: 'PUT', body: { name: open.name, alt: open.alt, folder: open.folder } });
      toast('Saved');
      setOpen(null);
      list.reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setBusy(false);
    }
  };
  const remove = async (m: Media) => {
    if (!(await confirm({ title: 'Delete this file?', text: 'If it is used on a listing or page, that image will stop showing. Files uploaded to Cloudinary are deleted there too.', confirm: 'Delete', danger: true }))) return;
    try {
      await api('media-sign', { body: { action: 'destroy', id: m._id } });
      toast('File deleted');
      setOpen(null);
      list.reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Media Library"
        subtitle="Photos, floor plans, brochures and banners — uploaded once, reused anywhere."
        actions={<button className="a-btn a-btn-gold shine" onClick={() => setShowUpload((s) => !s)}><ImagePlus className="h-4 w-4" /> Upload</button>}
      />
      {showUpload && (
        <div className="a-card mb-5 p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="a-label !mb-0">Upload to folder</span>
            <select className="a-input sm:w-56" value={upFolder} onChange={(e) => setUpFolder(e.target.value)}>{MEDIA_FOLDERS.map((f) => <option key={f}>{f}</option>)}</select>
          </div>
          <Dropzone folder={upFolder} onUploaded={() => list.reload()} />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input className="a-input flex-1" value={link} onChange={(e) => setLink(e.target.value)} placeholder="…or paste an image / PDF link https://" />
            <button className="a-btn a-btn-ink" disabled={!/^https?:\/\//.test(link.trim())} onClick={addLink}>Add link</button>
          </div>
        </div>
      )}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Tabs value={folder} onChange={(v) => { setFolder(v); setPage(1); }} tabs={[{ value: '', label: 'All' }, ...MEDIA_FOLDERS.map((f) => ({ value: f, label: f.replace('-', ' ') }))]} />
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search files…" className="lg:ml-auto lg:w-72" />
      </div>
      {list.error ? (
        <ErrorBox error={list.error} retry={list.reload} />
      ) : !list.data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 12 }, (_, i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-ink/5" />)}</div>
      ) : !list.data.items.length ? (
        <div className="a-card"><Empty icon={ImagePlus} title="Your library is empty" text="Upload photos or paste links. Images you add from listing forms also appear here." action={<button className="a-btn a-btn-ink" onClick={() => setShowUpload(true)}>Upload files</button>} /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {list.data.items.map((m) => (
              <button key={m._id} onClick={() => setOpen(m)} className="group overflow-hidden rounded-2xl border border-ink/[0.07] bg-white text-left transition hover:-translate-y-0.5 hover:shadow-luxe">
                <span className="block aspect-square overflow-hidden bg-ivory">
                  {m.resourceType === 'image' || isImage(m.url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb(m.url, 360)} alt={m.alt || m.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-ink/40">{m.resourceType === 'video' ? <Film className="h-8 w-8" /> : <FileText className="h-8 w-8" />}</span>
                  )}
                </span>
                <span className="block truncate px-3 pt-2 text-[12.5px] font-semibold">{m.name}</span>
                <span className="block px-3 pb-2.5 text-[11px] text-ink/45">{m.folder} {m.bytes ? `· ${size(m.bytes)}` : ''}</span>
              </button>
            ))}
          </div>
          <Pagination page={list.data.page} pages={list.data.pages} total={list.data.total} onPage={setPage} label="files" />
        </>
      )}
      {open && (
        <Drawer
          onClose={() => setOpen(null)}
          title={open.name}
          subtitle={`Added ${when(open.createdAt)}${open.width ? ` · ${open.width}×${open.height}` : ''}${open.bytes ? ` · ${size(open.bytes)}` : ''}`}
          footer={<><button onClick={() => remove(open)} className="a-btn a-btn-danger mr-auto"><Trash2 className="h-4 w-4" /> Delete</button><SaveButton busy={busy} onClick={save} /></>}
        >
          {isImage(open.url) || open.resourceType === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb(open.url, 900)} alt="" className="w-full rounded-2xl border border-ink/10" />
          ) : (
            <a href={open.url} target="_blank" rel="noopener" className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white p-4 font-semibold text-gold-dark"><FileText className="h-5 w-5" /> Open file</a>
          )}
          <div className="mt-5 grid gap-4">
            <Field label="File URL">
              <div className="flex gap-2">
                <input className="a-input font-mono text-[12px]" readOnly value={open.url} onFocus={(e) => e.target.select()} />
                <button className="a-btn a-btn-ghost" onClick={() => navigator.clipboard?.writeText(open.url).then(() => toast('URL copied'))}><Copy className="h-4 w-4" /></button>
                <a className="a-btn a-btn-ghost" href={open.url} target="_blank" rel="noopener"><ExternalLink className="h-4 w-4" /></a>
              </div>
            </Field>
            <Field label="Name"><input className="a-input" value={open.name} onChange={(e) => setOpen({ ...open, name: e.target.value })} /></Field>
            <Field label="Alt text" hint="Describes the image for Google & screen readers."><input className="a-input" value={open.alt ?? ''} onChange={(e) => setOpen({ ...open, alt: e.target.value })} /></Field>
            <Field label="Folder"><select className="a-input" value={open.folder} onChange={(e) => setOpen({ ...open, folder: e.target.value })}>{MEDIA_FOLDERS.map((f) => <option key={f}>{f}</option>)}</select></Field>
          </div>
        </Drawer>
      )}
    </div>
  );
}
