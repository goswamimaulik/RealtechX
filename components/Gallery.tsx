'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import SmartImage from './SmartImage';

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState<number | null>(null);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIdx(null);
      if (e.key === 'ArrowRight') setIdx((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === 'ArrowLeft') setIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, images.length]);

  return (
    <>
      <div className="grid h-[300px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl sm:h-[420px] md:h-[520px]">
        {images.slice(0, 5).map((src, i) => (
          <button
            key={src + i}
            onClick={() => setIdx(i)}
            className={`group relative overflow-hidden ${i === 0 ? 'col-span-4 row-span-2 md:col-span-2' : 'hidden md:block'}`}
            aria-label={`View photo ${i + 1}`}
          >
            <SmartImage src={src} alt={`${title} photo ${i + 1}`} fill priority={i === 0} sizes={i === 0 ? '(max-width:768px) 100vw, 50vw' : '25vw'} className="object-cover transition duration-700 group-hover:scale-105" />
            {i === 4 && (
              <span className="absolute inset-0 grid place-items-center bg-ink/50 text-sm font-bold text-white">
                <span className="flex items-center gap-2"><Images className="h-5 w-5" /> View all {images.length}</span>
              </span>
            )}
          </button>
        ))}
      </div>
      <button onClick={() => setIdx(0)} className="btn-outline mt-3 !py-2 text-xs md:hidden"><Images className="h-4 w-4" /> View all {images.length} photos</button>

      {idx !== null && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-ink/95 p-4" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between text-ivory">
            <p className="text-sm">{idx + 1} / {images.length}</p>
            <button onClick={() => setIdx(null)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10" aria-label="Close"><X className="h-5 w-5" /></button>
          </div>
          <div className="relative flex-1">
            <SmartImage src={images[idx]} alt={`${title} photo ${idx + 1}`} fill sizes="100vw" className="object-contain" />
            <button onClick={() => setIdx((idx - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white" aria-label="Previous"><ChevronLeft /></button>
            <button onClick={() => setIdx((idx + 1) % images.length)} className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white" aria-label="Next"><ChevronRight /></button>
          </div>
        </div>
      )}
    </>
  );
}
