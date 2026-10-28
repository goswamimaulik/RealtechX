import type { MetadataRoute } from 'next';
import { navTypes, statuses } from '@/lib/site';
import { getStore, allLocalitiesIn } from '@/lib/server/store';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getStore();
  const base = s.settings.url.replace(/\/$/, '');
  const u = (path: string, priority = 0.7, changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly', lastModified?: string) => ({
    url: `${base}${path}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency,
    priority,
  });
  const indexable = <T extends { seo?: { noindex?: boolean } }>(list: T[]) => list.filter((x) => !x.seo?.noindex);

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
    ...statuses.map((st) => u(`/status/${st.slug}`, 0.7, 'daily')),
    ...s.cities.filter((c) => s.properties.some((p) => p.city === c.slug)).map((c) => u(`/city/${c.slug}`, 0.8, 'daily')),
    ...allLocalitiesIn(s).map((l) => u(`/city/${l.city}/${l.slug}`, 0.7)),
    ...indexable(s.developers).map((d) => u(`/developers/${d.slug}`, 0.7)),
    ...indexable(s.properties).map((p) => u(`/property/${p.slug}`, 0.9, 'weekly', p.updatedAt || p.postedOn)),
    ...indexable(s.blogs).map((b) => u(`/blog/${b.slug}`, 0.6, 'monthly', b.updatedAt || b.date)),
    ...Object.keys(s.legal).map((l) => u(`/${l}`, 0.2, 'monthly')),
  ];
}
