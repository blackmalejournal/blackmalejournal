// src/lib/seo.ts

export { SITE_URL } from '@/lib/site-url';
import { SITE_URL } from '@/lib/site-url';

// ── Site constants ──────────────────────────────────────────────────────────
export const SITE_NAME = 'The Black Male Journal';
export const SITE_DESCRIPTION =
  'Independent media house and revolutionary masculinist platform covering health, philosophy, and politics for Black men.';
export const SITE_AUTHOR = 'The Chairman';

// ── JSON-LD: Organization ───────────────────────────────────────────────────
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description: SITE_DESCRIPTION,
    founder: {
      '@type': 'Person',
      name: SITE_AUTHOR,
    },
    sameAs: [],
  };
}

// ── JSON-LD: Article (works for articles, dispatches, briefings) ────────────
export function articleJsonLd(opts: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string | null;
  publishedAt: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    ...(opts.imageUrl ? { image: opts.imageUrl } : {}),
    datePublished: opts.publishedAt,
    author: {
      '@type': 'Person',
      name: opts.author ?? SITE_AUTHOR,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`,
      },
    },
  };
}

// ── JSON-LD: BreadcrumbList ─────────────────────────────────────────────────
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
