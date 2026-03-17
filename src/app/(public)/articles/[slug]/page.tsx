// src/app/(public)/articles/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getArticleBySlug, getArticles } from '@/lib/supabase/queries';
import { checkContentAccess } from '@/lib/supabase/access';
import { calculateReadingTime } from '@/lib/utils';
import { SITE_URL, articleJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { LensBadge } from '@/components/brand/LensBadge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RelatedArticles } from '@/components/content/RelatedArticles';
import { ArticleBody } from '@/components/content/ArticleBody';
import { PaywallGate } from '@/components/content/PaywallGate';
import PullQuoteSidebar from '@/components/content/PullQuoteSidebar';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: ArticlePageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found' };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.cover_image ? [{ url: article.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.cover_image ? [article.cover_image] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const { hasAccess, user } = await checkContentAccess(article.access_tier);

  const readingTime = calculateReadingTime(article.body);

  const related = await getArticles({ lens: article.lens, limit: 4 });
  const relatedFiltered = related
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  const formattedDate = new Date(article.published_at).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  const previewBody = article.body.slice(0, 300);

  return (
    <div className="mx-auto max-w-wide">
      <JsonLd
        data={articleJsonLd({
          title: article.title,
          description: article.excerpt,
          url: `${SITE_URL}/articles/${article.slug}`,
          imageUrl: article.cover_image,
          publishedAt: article.published_at,
          author: article.author,
        })}
      />

      <div className="mx-auto max-w-content px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Articles', href: '/articles' },
            { label: article.title },
          ]}
        />
      </div>

      {/* Article header */}
      <header className="mx-auto max-w-content px-4 pt-8 sm:px-6 lg:px-8">
        <LensBadge lens={article.lens} className="mb-4" />

        <h1 className="mb-4 font-display text-4xl leading-tight text-bmj-white sm:text-5xl lg:text-6xl">
          {article.title}
        </h1>

        <p className="mb-6 font-body text-xl italic leading-relaxed text-bmj-tan">
          {article.excerpt}
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="font-label text-xs uppercase tracking-widest text-bmj-cream/80">
            By {article.author}
          </span>
          <span className="font-mono text-xs text-bmj-tan">
            {formattedDate} · {readingTime} min read
          </span>
        </div>

        <div className="accent-border-bottom mb-0 pb-0" />
      </header>

      {/* Cover image */}
      {article.cover_image && (
        <div className="relative mt-8 h-64 w-full overflow-hidden sm:h-96 lg:h-[32rem]">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="halftone-heavy object-cover"
            priority
          />
        </div>
      )}

      {/* Article body */}
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        {hasAccess ? (
          <PullQuoteSidebar body={article.body}>
            <ArticleBody body={article.body} />
          </PullQuoteSidebar>
        ) : (
          <PaywallGate
            requiredTier={article.access_tier}
            previewBody={previewBody}
            isLoggedIn={!!user}
          />
        )}
      </div>

      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <RelatedArticles articles={relatedFiltered} lens={article.lens} />
      </div>
    </div>
  );
}
