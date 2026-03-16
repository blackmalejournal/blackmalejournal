// src/components/home/FeaturedArticles.tsx
import { StarDivider } from "@/components/ui/StarDivider";
import NewspaperGrid from "@/components/content/NewspaperGrid";
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
          <NewspaperGrid articles={articles} />
        ) : (
          <p className="text-center font-body text-base text-bmj-cream/50">
            Featured articles coming soon.
          </p>
        )}
      </div>
    </section>
  );
}
