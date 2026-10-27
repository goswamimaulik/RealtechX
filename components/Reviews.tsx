import { Quote, Star } from 'lucide-react';
import Carousel from './Carousel';
import { reviews } from '@/lib/data/reviews';

export default function Reviews() {
  return (
    <section className="section bg-ivory-200/50">
      <div className="container">
        <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Client stories</p>
            <h2 className="h-section mt-3">What buyers & partners say</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-gold text-gold" />)}
            </div>
            <span className="rounded-full border border-gold/40 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-dark">Sample reviews · preview</span>
          </div>
        </div>
        <Carousel label="Reviews" itemClassName="w-[85%] sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-13.4px)]">
          {reviews.map((r) => (
            <figure key={r.initials + r.role} className="relative flex h-full flex-col rounded-2xl border border-ink/[0.06] bg-white p-6 shadow-card md:p-8">
              <Quote className="absolute right-6 top-6 h-10 w-10 text-gold/20" />
              <div className="flex">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink/80">“{r.text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-ink/5 pt-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-ink font-display text-sm font-bold text-gold-light">{r.initials.replace(/\./g, '')}</span>
                <span>
                  <span className="block text-sm font-bold">{r.initials}</span>
                  <span className="block text-xs text-muted">{r.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
