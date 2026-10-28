import type { Metadata } from 'next';
import { getStore } from './store';
import { seoRoutes } from '../content-defaults';
import type { SeoFields } from '../types';

interface Fallback {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  absoluteTitle?: boolean;
}

/** Builds page metadata: admin SEO override → page defaults → site defaults. */
export function buildMeta(seo: SeoFields | undefined, fb: Fallback, siteName: string): Metadata {
  const title = seo?.title?.trim() || fb.title || siteName;
  const description = seo?.description?.trim() || fb.description || undefined;
  const image = seo?.ogImage?.trim() || fb.image;
  const canonical = seo?.canonical?.trim() || fb.canonical;
  const absolute = fb.absoluteTitle || !!seo?.title?.trim();
  return {
    title: absolute ? { absolute: title } : title,
    description,
    keywords: seo?.keywords ? seo.keywords.split(',').map((k) => k.trim()).filter(Boolean) : undefined,
    alternates: canonical ? { canonical } : undefined,
    robots: seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, images: image ? [{ url: image }] : undefined, url: canonical },
  };
}

/** Metadata for a static route editable in Admin → SEO. */
export async function pageMeta(route: string, fb: Fallback = {}): Promise<Metadata> {
  const s = await getStore();
  const def = seoRoutes.find((r) => r.route === route);
  return buildMeta(
    s.seoPages[route],
    {
      title: fb.title ?? def?.title,
      description: fb.description ?? (def?.description || s.settings.seo.defaultDescription),
      image: fb.image ?? (s.settings.seo.ogImage || undefined),
      canonical: fb.canonical ?? route,
      absoluteTitle: fb.absoluteTitle ?? route === '/',
    },
    s.settings.name,
  );
}
