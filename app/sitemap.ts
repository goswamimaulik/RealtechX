import type { MetadataRoute } from 'next';
import { site, navTypes, statuses } from '@/lib/site';
import { properties, allLocalities } from '@/lib/data/properties';
import { cities } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';
import { blogs } from '@/lib/data/blogs';
import { legalPages } from '@/lib/data/legal';

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string, priority = 0.7, changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly', lastModified?: string) => ({
    url: `${site.url}${path}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency,
    priority,
  });

  return [
    u('/', 1, 'daily'),
    u('/properties', 0.9, 'daily'),
    u('/buy', 0.9, 'daily'),
    u('/rent', 0.9, 'daily'),
    u('/sell', 0.6, 'monthly'),
    u('/developers', 0.7),
    u('/localities', 0.8, 'weekly'),
    u('/home-loan', 0.7, 'monthly'),
    u('/blog', 0.7),
    u('/about', 0.5, 'monthly'),
    u('/contact', 0.5, 'monthly'),
    ...navTypes.map((t) => u(`/property-type/${t.slug}`, 0.8, 'daily')),
    ...statuses.map((s) => u(`/status/${s.slug}`, 0.7, 'daily')),
    ...cities.map((c) => u(`/city/${c.slug}`, 0.8, 'daily')),
    ...allLocalities().map((l) => u(`/city/${l.city}/${l.slug}`, 0.7)),
    ...developers.map((d) => u(`/developers/${d.slug}`, 0.7)),
    ...properties.map((p) => u(`/property/${p.slug}`, 0.9, 'weekly', p.postedOn)),
    ...blogs.map((b) => u(`/blog/${b.slug}`, 0.6, 'monthly', b.date)),
    ...Object.keys(legalPages).map((l) => u(`/${l}`, 0.2, 'monthly')),
  ];
}
