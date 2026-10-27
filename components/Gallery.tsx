'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Grid2x2, X } from 'lucide-react';
import SmartImage from './SmartImage';

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIdx(null);
      if (e.key === 'ArrowRight') setIdx((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === 'ArrowLeft') setIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener('keydown', onKey);
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      html.style.overflow = '';
    };
  }, [idx, images.length]);

  const onScroll = () => {
    const el = rowRef.current;
    if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <>
      {/* Mobile / tablet: full-bleed swipe carousel */}
      <div className="relative -mx-4 md:-mx-6 lg:hidden">
        <div ref={rowRef} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
          {images.map((src, i) => (
            <button key={src + i} onClick={() => setIdx(i)} className="relative aspect-[4/3] w-full shrink-0 snap-center sm:aspect-[16/9]" aria-label={`View photo ${i + 1}`}>
              <SmartImage src={src} alt={`${title} photo ${i + 1}`} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/50 to-transparent" />
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />
          ))}
        </div>
        <button onClick={() => setIdx(slide)} className="absolute bottom-2.5 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-ink shadow">
          <Grid2x2 className="h-3.5 w-3.5" /> {slide + 1}/{images.length}
        </button>
      </div>

      {/* Desktop: large hero + two stacked */}
      <div className="relative hidden h-[500px] grid-cols-3 grid-rows-2 gap-2.5 overflow-hidden rounded-[28px] lg:grid xl:h-[540px]">
        {images.slice(0, 3).map((src, i) => (
          <button key={src + i} onClick={() => setIdx(i)} className={`group relative overflow-hidden ${i === 0 ? 'col-span-2 row-span-2' : ''}`} aria-label={`View photo ${i + 1}`}>
            <SmartImage src={src} alt={`${title} photo ${i + 1}`} fill priority={i === 0} sizes={i === 0 ? '66vw' : '33vw'} className="object-cover transition duration-700 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/10" />
          </button>
        ))}
        <button onClick={() => setIdx(0)} className="btn-white absolute bottom-5 right-5 !px-4 !py-2.5 text-[13px] shadow-luxe">
          <Grid2x2 className="h-4 w-4" /> Show all {images.length} photos
        </button>
      </div>

      {idx !== null && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-ink/95 p-3 md:p-6" role="dialog" aria-modal="true" aria-label="Photo gallery">
          <div className="flex items-center justify-between text-ivory">
            <p className="text-sm">{idx + 1} / {images.length}</p>
            <button onClick={() => setIdx(null)} className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink" aria-label="Close gallery"><X className="h-5 w-5" /></button>
          </div>
          <div className="relative my-3 min-h-0 flex-1">
            <SmartImage src={images[idx]} alt={`${title} photo ${idx + 1}`} fill sizes="100vw" className="object-contain" />
            <button onClick={() => setIdx((idx - 1 + images.length) % images.length)} className="absolute left-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur md:left-2 md:h-12 md:w-12" aria-label="Previous"><ChevronLeft /></button>
            <button onClick={() => setIdx((idx + 1) % images.length)} className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur md:right-2 md:h-12 md:w-12" aria-label="Next"><ChevronRight /></button>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto md:justify-center">
            {images.map((src, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ${i === idx ? 'ring-2 ring-gold' : 'opacity-60'}`} aria-label={`Photo ${i + 1}`}>
                <SmartImage src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
