import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { getArticles } from '@/lib/supabase/queries';
import { extractTags, calculateReadingTime } from '@/lib/utils';
import { StarDivider } from '@/components/ui/StarDivider';
import { ArticleCard } from '@/components/content/ArticleCard';
import NewspaperGrid from '@/components/content/NewspaperGrid';
import { LensFilterTabs } from '@/components/content/LensFilterTabs';
import { TagFilterRow } from '@/components/content/TagFilterRow';
import type { Lens } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Long-form articles on health, philosophy, and politics for Black men.',
  openGraph: {
    title: 'Articles',
    description:
      'Long-form articles on health, philosophy, and politics for Black men.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles',
    description:
      'Long-form articles on health, philosophy, and politics for Black men.',
  },
};

const VALID_LENSES = new Set<string>(['health', 'philosophy', 'politics']);
const PAGE_SIZE = 9;

interface ArticlesPageProps {
  searchParams: Promise<{ lens?: string; tag?: string; page?: string }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { lens: rawLens, tag, page: rawPage } = await searchParams;

  const activeLens = VALID_LENSES.has(rawLens ?? '')
    ? (rawLens as Lens)
    : undefined;
  const activeTag = tag ?? null;
  const parsedPage = parseInt(rawPage ?? '1', 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);

  // Fetch one extra to know if there's a next page
  const articles = await getArticles({
    lens: activeLens,
    tag: activeTag ?? undefined,
    limit: PAGE_SIZE * page + 1,
    offset: 0,
  });

  const hasMore = articles.length > PAGE_SIZE * page;
  const visible = articles.slice(0, PAGE_SIZE * page);

  // Extract tags from the full unfiltered set for the tag row
  const allArticles = activeLens
    ? await getArticles({ lens: activeLens, limit: 200 })
    : await getArticles({ limit: 200 });
  const tags = extractTags(allArticles);

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      {/* Page header */}
      <h1 className="font-display text-5xl text-bmj-white">Articles</h1>
      <StarDivider className="mb-6" />

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <Suspense fallback={<div className="h-10 border-b border-bmj-tan/20" />}>
          <LensFilterTabs activeLens={activeLens ?? 'all'} />
        </Suspense>
        <Suspense fallback={<div className="h-8" />}>
          <TagFilterRow tags={tags} activeTag={activeTag} />
        </Suspense>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-label text-bmj-tan">No articles found.</p>
          <p className="mt-2 font-body text-sm text-bmj-tan/60">
            Try selecting a different lens or clearing the tag filter.
          </p>
        </div>
      ) : (
        <>
          {visible.length >= 3 && (
            <NewspaperGrid articles={visible.slice(0, 3)} />
          )}

          {visible.length > 3 && (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.slice(3).map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  lens={article.lens}
                  excerpt={article.excerpt}
                  readingTime={calculateReadingTime(article.body)}
                  publishedAt={article.published_at}
                  coverImage={article.cover_image}
                  isPremium={article.access_tier !== 'free'}
                />
              ))}
            </div>
          )}

          {visible.length > 0 && visible.length < 3 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  lens={article.lens}
                  excerpt={article.excerpt}
                  readingTime={calculateReadingTime(article.body)}
                  publishedAt={article.published_at}
                  coverImage={article.cover_image}
                  isPremium={article.access_tier !== 'free'}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-12 text-center">
              <Link
                href={`/articles?${new URLSearchParams({
                  ...(activeLens ? { lens: activeLens } : {}),
                  ...(activeTag ? { tag: activeTag } : {}),
                  page: String(page + 1),
                }).toString()}`}
                className="inline-block border border-bmj-tan/40 px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
              >
                Load More
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
