'use client';

import { Children, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Swipeable snap carousel.
 * Mobile: 2 cards per view. Tablet: 3. Desktop: 4 (configurable).
 */
export default function Carousel({
  children,
  itemClassName = 'w-[calc(50%-6px)] md:w-[calc(33.333%-13.4px)] lg:w-[calc(25%-15px)]',
  label = 'Carousel',
}: {
  children: React.ReactNode;
  itemClassName?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth, behavior: 'smooth' });

  return (
    <div className="relative" role="region" aria-label={label}>
      <div ref={ref} className="snap-row">
        {Children.map(children, (child) => (
          <div className={`snap-item ${itemClassName}`}>{child}</div>
        ))}
      </div>
      {(canPrev || canNext) && (
        <div className="pointer-events-none absolute inset-y-0 -left-5 -right-5 hidden items-center justify-between md:flex">
          <button
            onClick={() => go(-1)}
            disabled={!canPrev}
            className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-ink/10 bg-white shadow-luxe transition hover:border-gold disabled:opacity-0"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            disabled={!canNext}
            className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-ink/10 bg-white shadow-luxe transition hover:border-gold disabled:opacity-0"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
