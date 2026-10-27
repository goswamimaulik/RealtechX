'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
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
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [idx, images.length]);

  const onScroll = () => {
    const el = rowRef.current;
    if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <>
      {/* Mobile: swipe carousel */}
      <div className="relative -mx-4 md:hidden">
        <div ref={rowRef} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
          {images.map((src, i) => (
            <button key={src + i} onClick={() => setIdx(i)} className="relative aspect-[4/3] w-full shrink-0 snap-center" aria-label={`View photo ${i + 1}`}>
              <SmartImage src={src} alt={`${title} photo ${i + 1}`} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
          <Images className="h-3.5 w-3.5" /> {slide + 1} / {images.length}
        </span>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* Desktop: mosaic */}
      <div className="hidden h-[480px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:grid lg:h-[540px]">
        {images.slice(0, 5).map((src, i) => (
          <button key={src + i} onClick={() => setIdx(i)} className={`group relative overflow-hidden ${i === 0 ? 'col-span-2 row-span-2' : ''}`} aria-label={`View photo ${i + 1}`}>
            <SmartImage src={src} alt={`${title} photo ${i + 1}`} fill priority={i === 0} sizes={i === 0 ? '50vw' : '25vw'} className="object-cover transition duration-700 group-hover:scale-105" />
            {i === 4 && (
              <span className="absolute inset-0 grid place-items-center bg-ink/55 text-sm font-bold text-white">
                <span className="flex items-center gap-2"><Images className="h-5 w-5" /> Show all {images.length} photos</span>
              </span>
            )}
          </button>
        ))}
      </div>

      {idx !== null && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-ink/95 p-3 md:p-6" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between text-ivory">
            <p className="text-sm">{idx + 1} / {images.length}</p>
            <button onClick={() => setIdx(null)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10" aria-label="Close"><X className="h-5 w-5" /></button>
          </div>
          <div className="relative my-3 flex-1">
            <SmartImage src={images[idx]} alt={`${title} photo ${idx + 1}`} fill sizes="100vw" className="object-contain" />
            <button onClick={() => setIdx((idx - 1 + images.length) % images.length)} className="absolute left-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white md:left-2 md:h-12 md:w-12" aria-label="Previous"><ChevronLeft /></button>
            <button onClick={() => setIdx((idx + 1) % images.length)} className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white md:right-2 md:h-12 md:w-12" aria-label="Next"><ChevronRight /></button>
          </div>
          <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto">
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
