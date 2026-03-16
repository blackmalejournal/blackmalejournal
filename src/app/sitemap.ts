import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import {
  getArticles,
  getBriefings,
  getCourses,
  getDispatches,
} from '@/lib/supabase/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/articles`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/briefings`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/academy`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/video`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/pricing`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/support`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [articles, briefings, courses, dispatches] = await Promise.all([
    getArticles({ limit: 500 }),
    getBriefings({ limit: 200 }),
    getCourses({ published: true }),
    getDispatches({ limit: 500 }),
  ]);

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: a.published_at,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const briefingEntries: MetadataRoute.Sitemap = briefings.map((b) => ({
    url: `${SITE_URL}/briefings/${b.slug}`,
    lastModified: b.published_at,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${SITE_URL}/academy/${c.slug}`,
    lastModified: c.created_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const dispatchEntries: MetadataRoute.Sitemap = dispatches.map((d) => ({
    url: `${SITE_URL}/blog/${d.slug}`,
    lastModified: d.published_at,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...articleEntries,
    ...briefingEntries,
    ...courseEntries,
    ...dispatchEntries,
  ];
}
