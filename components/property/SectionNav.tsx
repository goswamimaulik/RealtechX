'use client';

import { useEffect, useRef, useState } from 'react';

/** Sticky in-page nav that highlights the section currently in view (scroll-spy). */
export default function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const navRef = useRef<HTMLElement>(null);
  const clickLock = useRef<number>(0);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const onScroll = () => {
      if (Date.now() < (clickLock.current ?? 0)) return;
      const line = window.innerHeight * 0.3; // a section is "current" once its top passes 30% of the viewport
      let current = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      // at the very bottom, light up the last section
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = els[els.length - 1].id;
      setActive((a) => (a === current ? a : current));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items]);

  // keep the active pill visible inside the horizontally-scrolling nav
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLAnchorElement>(`a[data-id="${active}"]`);
    if (!nav || !link) return;
    const left = link.offsetLeft - nav.clientWidth / 2 + link.clientWidth / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [active]);

  return (
    <nav
      ref={navRef}
      className="no-scrollbar sticky top-16 z-20 -mx-4 mt-7 flex gap-1 overflow-x-auto border-y border-ink/[0.06] bg-ivory/95 px-4 py-2 backdrop-blur md:-mx-6 md:px-6 lg:top-[74px] lg:mx-0 lg:mt-9 lg:rounded-full lg:border lg:bg-white/95 lg:px-2 lg:shadow-card"
      aria-label="Sections"
    >
      {items.map((t) => {
        const on = active === t.id;
        return (
          <a
            key={t.id}
            data-id={t.id}
            href={`#${t.id}`}
            onClick={() => {
              setActive(t.id);
              clickLock.current = Date.now() + 900; // let the smooth scroll finish before spying again
            }}
            aria-current={on ? 'true' : undefined}
            className={`relative shrink-0 rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors duration-300 ${on ? 'bg-ink text-ivory shadow-[0_6px_16px_-8px_rgba(11,16,32,.6)]' : 'text-ink/70 hover:bg-ivory-200 hover:text-ink'}`}
          >
            {t.label}
            {on && <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />}
          </a>
        );
      })}
    </nav>
  );
}
