// src/components/home/FeaturedArticles.tsx
import { ArticleCard } from "@/components/content/ArticleCard";
import { StarDivider } from "@/components/ui/StarDivider";
import { calculateReadingTime } from "@/lib/utils";
import type { Article } from "@/lib/supabase/types";

interface FeaturedArticlesProps {
  articles: Article[];
}

export function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  return (
    <section className="bg-bmj-black py-20">
      <div className="mx-auto max-w-content px-6">
        <StarDivider className="mb-8" />

        <h2 className="mb-12 text-center font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
          Featured
        </h2>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.slug}
                title={article.title}
                slug={article.slug}
                lens={article.lens}
                excerpt={article.excerpt}
                readingTime={calculateReadingTime(article.body)}
                publishedAt={article.published_at}
                coverImage={article.cover_image ?? undefined}
                isPremium={article.access_tier !== 'free'}
              />
            ))}
          </div>
        ) : (
          <p className="text-center font-body text-base text-bmj-cream/50">
            Featured articles coming soon.
          </p>
        )}
      </div>
    </section>
  );
}
