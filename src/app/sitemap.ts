import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { PATHS } from '@/lib/paths';
import {
  getArticles,
  getBriefings,
  getCourses,
  getDispatches,
  getHandbooks,
  getLessonsByCourse,
} from '@/lib/supabase/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}${PATHS.ARTICLES}`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}${PATHS.BRIEFINGS}`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}${PATHS.ACADEMY}`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}${PATHS.VIDEO}`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}${PATHS.BLOG}`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}${PATHS.ABOUT}`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}${PATHS.HANDBOOKS}`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}${PATHS.DOWNLOADS}`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}${PATHS.RECORDS}`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}${PATHS.PRICING}`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}${PATHS.CONTACT}`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}${PATHS.SUPPORT}`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}${PATHS.PRIVACY}`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}${PATHS.TERMS}`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [articles, briefings, courses, dispatches, handbooks] = await Promise.all([
    getArticles({ limit: 500 }),
    getBriefings({ limit: 200 }),
    getCourses({ published: true }),
    getDispatches({ limit: 500 }),
    getHandbooks({ limit: 200 }),
  ]);

  // Fetch lessons for each published course
  const courseLessons = await Promise.all(
    courses.map(async (c) => {
      const lessons = await getLessonsByCourse(c.id);
      return lessons.map((l) => ({ courseSlug: c.slug, lesson: l }));
    }),
  );
  const allLessons = courseLessons.flat();

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}${PATHS.ARTICLES}/${a.slug}`,
    lastModified: a.published_at,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const briefingEntries: MetadataRoute.Sitemap = briefings.map((b) => ({
    url: `${SITE_URL}${PATHS.BRIEFINGS}/${b.slug}`,
    lastModified: b.published_at,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${SITE_URL}${PATHS.ACADEMY}/${c.slug}`,
    lastModified: c.created_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const dispatchEntries: MetadataRoute.Sitemap = dispatches.map((d) => ({
    url: `${SITE_URL}${PATHS.BLOG}/${d.slug}`,
    lastModified: d.published_at,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const handbookEntries: MetadataRoute.Sitemap = handbooks.map((h) => ({
    url: `${SITE_URL}${PATHS.HANDBOOKS}/${h.slug}`,
    lastModified: h.published_at,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const lessonEntries: MetadataRoute.Sitemap = allLessons.map(({ courseSlug, lesson }) => ({
    url: `${SITE_URL}${PATHS.ACADEMY}/${courseSlug}/${lesson.slug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...articleEntries,
    ...briefingEntries,
    ...courseEntries,
    ...dispatchEntries,
    ...handbookEntries,
    ...lessonEntries,
  ];
}
