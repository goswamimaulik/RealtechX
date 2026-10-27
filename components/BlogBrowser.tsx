'use client';

import { useState } from 'react';
import type { BlogPost } from '@/lib/types';
import BlogCard from './BlogCard';

export default function BlogBrowser({ posts }: { posts: BlogPost[] }) {
  const cats = ['All', ...Array.from(new Set(posts.map((p) => p.category)))];
  const [cat, setCat] = useState('All');
  const list = cat === 'All' ? posts : posts.filter((p) => p.category === cat);
  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-7 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0" role="tablist">
        {cats.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-medium transition ${cat === c ? 'border-ink bg-ink text-ivory' : 'border-ink/10 bg-white text-ink/75 hover:border-gold'}`}
          >
            {c} <span className="opacity-60">({c === 'All' ? posts.length : posts.filter((p) => p.category === c).length})</span>
          </button>
        ))}
      </div>
      <div key={cat} className="grid animate-fadeIn gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((b) => <BlogCard key={b.slug} b={b} />)}
      </div>
    </div>
  );
}
