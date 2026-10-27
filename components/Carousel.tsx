'use client';

import { Children, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Peek widths: mobile 1 card + peek, tablet ~2.3, desktop 3 cards + a peek of the 4th. */
export const PEEK = 'w-[82%] sm:w-[calc((100%-12px)/1.6)] md:w-[calc((100%-40px)/2.3)] lg:w-[calc((100%-60px)/3.3)]';
export const PEEK_SMALL = 'w-[46%] sm:w-[32%] md:w-[calc((100%-60px)/3.4)] lg:w-[calc((100%-80px)/5)]';

export default function Carousel({ children, itemClassName = PEEK, label = 'Carousel' }: { children: React.ReactNode; itemClassName?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const item = el.firstElementChild as HTMLElement | null;
    const step = item ? item.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0') : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div className="group/car relative" role="region" aria-label={label}>
      <div ref={ref} className="snap-row">
        {Children.map(children, (child) => <div className={`snap-item ${itemClassName}`}>{child}</div>)}
      </div>
      {[
        { dir: -1 as const, show: canPrev, Icon: ChevronLeft, cls: 'left-0 -translate-x-1/2', name: 'Previous' },
        { dir: 1 as const, show: canNext, Icon: ChevronRight, cls: 'right-0 translate-x-1/2', name: 'Next' },
      ].map(({ dir, show, Icon, cls, name }) => (
        <button
          key={name}
          type="button"
          onClick={() => go(dir)}
          className={`absolute top-[38%] z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ink/10 bg-white text-ink shadow-luxe transition hover:border-gold hover:bg-ink hover:text-gold-light lg:grid ${cls} ${show ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          aria-label={name}
          tabIndex={show ? 0 : -1}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}
