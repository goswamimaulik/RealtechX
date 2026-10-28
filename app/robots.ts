import type { MetadataRoute } from 'next';
import { getStore } from '@/lib/server/store';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getStore();
  const base = s.settings.url.replace(/\/$/, '');
  if (!s.settings.seo.indexing) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/shortlist', '/thank-you'] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
