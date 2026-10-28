'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FileText, Film, ImagePlus, Link2, Star, Trash2, UploadCloud, X } from 'lucide-react';
import { api, qs } from './api';
import { Modal, Spinner, Tabs, SearchBox, useAdmin, Empty } from './ui';

export interface Media {
  _id: string;
  url: string;
  name: string;
  alt?: string;
  folder: string;
  resourceType: 'image' | 'video' | 'raw';
  bytes?: number;
  width?: number;
  height?: number;
  format?: string;
  publicId?: string;
  createdAt: string;
}

export const MEDIA_FOLDERS = ['properties', 'floor-plans', 'banners', 'brochures', 'developers', 'blog', 'logos', 'general'];

export const isImage = (u: string) => /\.(jpe?g|png|webp|avif|gif|svg)(\?|$)/i.test(u) || /images\.unsplash\.com|res\.cloudinary\.com\/.+\/image\//i.test(u);

/** Signed direct upload: browser → Cloudinary, then the file is registered in the media library. */
export async function uploadFile(file: File, folder: string, onProgress?: (pct: number) => void): Promise<Media> {
  const sig = await api<{ cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string; maxMb: number; types: string }>('media-sign', { body: { folder } });
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const allowed = sig.types.split(',').map((t) => t.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(ext)) throw new Error(`.${ext} files are not allowed. Allowed: ${allowed.join(', ')}`);
  if (file.size > sig.maxMb * 1024 * 1024) throw new Error(`${file.name} is larger than ${sig.maxMb} MB.`);

  const fd = new FormData();
  fd.set('file', file);
  fd.set('api_key', sig.apiKey);
  fd.set('timestamp', String(sig.timestamp));
  fd.set('folder', sig.folder);
  fd.set('signature', sig.signature);

  const res = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const j = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(j);
        else reject(new Error(j?.error?.message || 'Upload failed'));
      } catch {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Network error while uploading'));
    xhr.send(fd);
  });

  const { item } = await api<{ item: Media }>('media', {
    body: {
      url: res.secure_url,
      publicId: res.public_id,
      resourceType: res.resource_type,
      folder,
      name: file.name,
      bytes: res.bytes,
      width: res.width,
      height: res.height,
      format: res.format,
    },
  });
  return item;
}

/** Cloudinary on-the-fly thumbnail (other hosts returned unchanged). */
export const thumb = (u: string, w = 400) => (u.includes('res.cloudinary.com') && u.includes('/image/upload/') ? u.replace('/image/upload/', `/image/upload/c_fill,w_${w},h_${Math.round(w * 0.75)},q_auto,f_auto/`) : u.includes('images.unsplash.com') ? u.replace(/([?&])w=\d+/, `$1w=${w}`) : u);

function Thumb({ m, selected, onClick }: { m: Media; selected: boolean; onClick: () => void }) {
  const img = m.resourceType === 'image' || isImage(m.url);
  return (
    <button type="button" onClick={onClick} className={`group relative aspect-[4/3] overflow-hidden rounded-xl border-2 bg-ivory transition ${selected ? 'border-gold ring-4 ring-gold/20' : 'border-transparent hover:border-gold/50'}`}>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb(m.url)} alt={m.alt || m.name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="flex h-full flex-col items-center justify-center gap-1 p-2 text-ink/50">
          {m.resourceType === 'video' ? <Film className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
          <span className="line-clamp-2 text-[11px]">{m.name}</span>
        </span>
      )}
      {selected && <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-gold text-ink shadow"><Check className="h-3.5 w-3.5" /></span>}
    </button>
  );
}

/** Upload drop-zone used by the picker and the media library page. */
export function Dropzone({ folder, onUploaded, accept = 'image/*,application/pdf,video/mp4', multiple = true, compact = false }: { folder: string; onUploaded: (m: Media[]) => void; accept?: string; multiple?: boolean; compact?: boolean }) {
  const { toast } = useAdmin();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<{ name: string; pct: number }[]>([]);
  const [over, setOver] = useState(false);

  const run = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, 20);
    if (!list.length) return;
    setBusy(list.map((f) => ({ name: f.name, pct: 0 })));
    const done: Media[] = [];
    for (const [i, f] of list.entries()) {
      try {
        done.push(await uploadFile(f, folder, (pct) => setBusy((b) => b.map((x, j) => (j === i ? { ...x, pct } : x)))));
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Upload failed', 'error');
      }
    }
    setBusy([]);
    if (done.length) {
      toast(`${done.length} file${done.length === 1 ? '' : 's'} uploaded`);
      onUploaded(done);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        run(e.dataTransfer.files);
      }}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition ${compact ? 'px-4 py-6' : 'px-6 py-12'} ${over ? 'border-gold bg-gold-50/60' : 'border-ink/15 bg-ivory/40'}`}
    >
      <input ref={input} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => e.target.files && run(e.target.files)} />
      {busy.length ? (
        <div className="w-full max-w-sm space-y-2">
          {busy.map((b) => (
            <div key={b.name} className="text-left text-[12.5px]">
              <div className="flex justify-between"><span className="truncate">{b.name}</span><span className="font-semibold">{b.pct}%</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-gold-grad transition-all" style={{ width: `${b.pct}%` }} /></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-gold-dark shadow-card"><UploadCloud className="h-6 w-6" /></span>
          <p className="mt-3 text-[14px] font-semibold">Drag & drop files here</p>
          <p className="mt-0.5 text-[12px] text-ink/50">JPG, PNG, WebP, PDF or MP4 · saved to “{folder}”</p>
          <button type="button" onClick={() => input.current?.click()} className="a-btn a-btn-ink a-btn-sm mt-4">Choose files</button>
        </>
      )}
    </div>
  );
}

/** Modal to pick one or more files from the library, upload new ones, or paste a link. */
export function MediaPicker({ onClose, onPick, multiple = false, folder = 'general', kind = 'image' }: { onClose: () => void; onPick: (urls: string[]) => void; multiple?: boolean; folder?: string; kind?: 'image' | 'any' }) {
  const [tab, setTab] = useState<'library' | 'upload' | 'link'>('library');
  const [items, setItems] = useState<Media[]>([]);
  const [q, setQ] = useState('');
  const [f, setF] = useState('');
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<string[]>([]);
  const [link, setLink] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api<{ items: Media[] }>(`media${qs({ q, folder: f, resourceType: kind === 'image' ? 'image' : '', limit: 120 })}`)
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [q, f, kind]);
  useEffect(() => load(), [load]);

  const toggle = (u: string) => setSel((s) => (multiple ? (s.includes(u) ? s.filter((x) => x !== u) : [...s, u]) : [u]));
  const linkOk = /^https?:\/\/\S+$/i.test(link.trim());

  return (
    <Modal onClose={onClose} size="xl" title={multiple ? 'Add media' : 'Choose media'}>
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'library', label: 'Media library' },
            { value: 'upload', label: <><UploadCloud className="h-3.5 w-3.5" /> Upload</> },
            { value: 'link', label: <><Link2 className="h-3.5 w-3.5" /> Paste link</> },
          ]}
        />
        {tab === 'library' && (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchBox value={q} onChange={setQ} placeholder="Search files…" className="flex-1" />
              <select value={f} onChange={(e) => setF(e.target.value)} className="a-input sm:w-48">
                <option value="">All folders</option>
                {MEDIA_FOLDERS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
            {loading ? (
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">{Array.from({ length: 10 }, (_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-ink/5" />)}</div>
            ) : items.length ? (
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">{items.map((m) => <Thumb key={m._id} m={m} selected={sel.includes(m.url)} onClick={() => toggle(m.url)} />)}</div>
            ) : (
              <Empty icon={ImagePlus} title="No files yet" text="Upload images or paste a link to use them across the website." action={<button className="a-btn a-btn-ink" onClick={() => setTab('upload')}>Upload files</button>} />
            )}
          </>
        )}
        {tab === 'upload' && (
          <Dropzone
            folder={folder}
            accept={kind === 'image' ? 'image/*' : 'image/*,application/pdf,video/mp4'}
            multiple={multiple}
            onUploaded={(ms) => {
              setItems((cur) => [...ms, ...cur]);
              setSel((s) => (multiple ? [...s, ...ms.map((m) => m.url)] : [ms[0].url]));
              setTab('library');
            }}
          />
        )}
        {tab === 'link' && (
          <div className="space-y-3">
            <p className="text-[13px] text-ink/60">Paste a direct link to an image or file (for example from your developer’s website, Google Drive public link or Cloudinary).</p>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" className="a-input" autoFocus />
            {linkOk && isImage(link) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={link} alt="" className="max-h-56 rounded-xl border border-ink/10 object-contain" />
            )}
          </div>
        )}
      </div>
      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-ink/[0.07] bg-white px-5 py-3.5 sm:px-6">
        <span className="text-[12.5px] text-ink/55">{tab === 'link' ? '' : `${sel.length} selected`}</span>
        <div className="flex gap-2">
          <button className="a-btn a-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="a-btn a-btn-gold"
            disabled={tab === 'link' ? !linkOk : !sel.length}
            onClick={() => {
              onPick(tab === 'link' ? [link.trim()] : sel);
              onClose();
            }}
          >
            {multiple ? 'Add selected' : 'Use this'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** Single image (logo, cover, banner…). */
export function ImageField({ value, onChange, folder = 'general', aspect = 'aspect-[16/9]', kind = 'image', contain = false }: { value: string; onChange: (v: string) => void; folder?: string; aspect?: string; kind?: 'image' | 'any'; contain?: boolean }) {
  const [open, setOpen] = useState(false);
  const img = !value || isImage(value) || kind === 'image';
  return (
    <div>
      {value ? (
        <div className={`group relative overflow-hidden rounded-2xl border border-ink/10 bg-ivory ${img ? aspect : ''}`}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb(value, 800)} alt="" className={`h-full w-full ${contain ? 'object-contain p-3' : 'object-cover'}`} />
          ) : (
            <a href={value} target="_blank" rel="noopener" className="flex items-center gap-3 p-4 text-[13px] font-semibold text-gold-dark"><FileText className="h-5 w-5" /> <span className="truncate">{value.split('/').pop()}</span></a>
          )}
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-white/95 px-2.5 py-1.5 text-[12px] font-semibold shadow hover:text-gold-dark">Change</button>
            <button type="button" aria-label="Remove" onClick={() => onChange('')} className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-rose-600 shadow"><X className="h-4 w-4" /></button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-ivory/40 text-ink/50 transition hover:border-gold hover:text-gold-dark ${kind === 'image' ? aspect : 'py-6'}`}>
          <ImagePlus className="h-6 w-6" />
          <span className="text-[12.5px] font-semibold">{kind === 'image' ? 'Choose image' : 'Choose file'}</span>
        </button>
      )}
      {open && <MediaPicker folder={folder} kind={kind} onClose={() => setOpen(false)} onPick={(u) => onChange(u[0])} />}
    </div>
  );
}

/** Image gallery editor — first image is the cover. */
export function ImagesField({ value, onChange, folder = 'properties', max = 40 }: { value: string[]; onChange: (v: string[]) => void; folder?: string; max?: number }) {
  const [open, setOpen] = useState(false);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const n = [...value];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((u, i) => (
          <div key={u + i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-ink/10 bg-ivory">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb(u)} alt="" className="h-full w-full object-cover" loading="lazy" />
            {i === 0 && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10.5px] font-bold text-ink"><Star className="h-3 w-3" /> Cover</span>}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-ink/80 to-transparent p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <div className="flex gap-1">
                <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 disabled:opacity-30"><ArrowLeft className="h-3.5 w-3.5" /></button>
                <button type="button" aria-label="Move right" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 disabled:opacity-30"><ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex gap-1">
                {i !== 0 && <button type="button" onClick={() => onChange([u, ...value.filter((_, j) => j !== i)])} className="rounded-lg bg-white/90 px-2 text-[11px] font-semibold leading-7">Cover</button>}
                <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        {value.length < max && (
          <button type="button" onClick={() => setOpen(true)} className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink/15 bg-ivory/40 text-ink/50 transition hover:border-gold hover:text-gold-dark">
            <ImagePlus className="h-6 w-6" />
            <span className="text-[12px] font-semibold">Add images</span>
          </button>
        )}
      </div>
      {open && <MediaPicker multiple folder={folder} onClose={() => setOpen(false)} onPick={(u) => onChange([...value, ...u.filter((x) => !value.includes(x))].slice(0, max))} />}
    </div>
  );
}
