// src/app/(public)/articles/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleBySlug, getArticles, getMemberById } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import { calculateReadingTime } from '@/lib/utils';
import { LensBadge } from '@/components/brand/LensBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { ArticleCard } from '@/components/content/ArticleCard';
import { ArticleBody } from '@/components/content/ArticleBody';
import { PaywallGate } from '@/components/content/PaywallGate';

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

  // Access check (must happen before body enters the JSX tree)
  const TIER_RANK: Record<string, number> = { free: 0, basic: 1, premium: 2 };
  const isFree = article.access_tier === 'free';
  let hasAccess = isFree;

  if (!isFree) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const member = await getMemberById(user.id);
      if (member) {
        hasAccess = TIER_RANK[member.tier] >= TIER_RANK[article.access_tier];
      }
    }
  }

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
      {/* Back link */}
      <div className="mx-auto max-w-content px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/articles"
          className="font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
        >
          ← Back to Articles
        </Link>
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
          <span className="font-mono text-xs text-bmj-tan/60">
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
            className="halftone object-cover"
            priority
          />
        </div>
      )}

      {/* Article body */}
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        {hasAccess ? (
          <ArticleBody body={article.body} />
        ) : (
          <PaywallGate requiredTier={article.access_tier} previewBody={previewBody} />
        )}
      </div>

      <StarDivider className="mx-auto max-w-content px-4 sm:px-6 lg:px-8" />

      {/* Related articles */}
      {relatedFiltered.length > 0 && (
        <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-8 font-display text-2xl text-bmj-white">
            More from {article.lens.charAt(0).toUpperCase() + article.lens.slice(1)}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedFiltered.map((a) => (
              <ArticleCard
                key={a.id}
                title={a.title}
                slug={a.slug}
                lens={a.lens}
                excerpt={a.excerpt}
                readingTime={calculateReadingTime(a.body)}
                publishedAt={a.published_at}
                coverImage={a.cover_image}
                isPremium={a.access_tier !== 'free'}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
