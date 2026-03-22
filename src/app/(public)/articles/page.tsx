import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { getArticles } from '@/lib/supabase/queries';
import { extractTags, calculateReadingTime } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArticleCard } from '@/components/content/ArticleCard';
import NewspaperGrid from '@/components/content/NewspaperGrid';
import { LensFilterTabs } from '@/components/content/LensFilterTabs';
import { TagFilterRow } from '@/components/content/TagFilterRow';
import type { Article, Lens } from '@/lib/supabase/types';

export const revalidate = 60;

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

function ArticleCardGrid({ articles }: { articles: Article[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
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
          isFeatured={article.featured}
        />
      ))}
    </div>
  );
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

  // Split visible articles into newspaper grid (first 3) and standard grid (rest)
  const newspaperArticles = visible.slice(0, 3);
  const remainingArticles = visible.slice(3);

  return (
    <div className="page-shell py-16">
      <PageHeader
        label="The Archive"
        title="Articles"
        description="Long-form argument across health, philosophy, and politics. This is the slow record of the publication."
        dividerClassName="mb-8"
      />

      {/* Filters */}
      <div className="surface-panel mb-8 space-y-4 p-4 sm:p-6">
        <Suspense fallback={<div className="h-10 border-b border-bmj-tan/20" />}>
          <LensFilterTabs activeLens={activeLens ?? 'all'} />
        </Suspense>
        <Suspense fallback={<div className="h-8" />}>
          <TagFilterRow tags={tags} activeTag={activeTag} />
        </Suspense>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <EmptyState
          heading="No articles found"
          description="Try selecting a different lens or clearing the tag filter."
          actionLabel="Clear filters"
          actionHref="/articles"
        />
      ) : (
        <>
          {newspaperArticles.length >= 3 ? (
            <NewspaperGrid articles={newspaperArticles} />
          ) : (
            <ArticleCardGrid articles={newspaperArticles} />
          )}

          {remainingArticles.length > 0 && (
            <div className="mt-6">
              <ArticleCardGrid articles={remainingArticles} />
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
                className="btn-ghost"
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
