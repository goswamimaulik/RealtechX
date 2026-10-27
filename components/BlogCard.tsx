import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import Image from './SmartImage';
import type { BlogPost } from '@/lib/types';
import { formatDate } from '@/lib/format';

export default function BlogCard({ b }: { b: BlogPost }) {
  return (
    <Link href={`/blog/${b.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-ink/[0.07] bg-white shadow-[0_6px_24px_-14px_rgba(11,16,32,.25)] transition duration-300 hover:-translate-y-1 hover:shadow-luxe">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={b.cover} alt={b.title} fill sizes="(max-width:640px) 85vw, (max-width:1024px) 45vw, 30vw" className="object-cover transition duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">{b.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-[12px] text-muted">{formatDate(b.date)} <span>·</span> <Clock className="h-3 w-3" /> {b.readTime}</p>
        <h3 className="mt-2 line-clamp-2 font-display text-[19px] font-semibold leading-snug transition group-hover:text-gold-dark">{b.title}</h3>
        <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-muted">{b.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-semibold text-ink group-hover:text-gold-dark">
          Read article <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
