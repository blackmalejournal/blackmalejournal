import Image from 'next/image';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { LensBadge } from '@/components/brand/LensBadge';
import { getLensTheme } from '@/lib/lens-theme';
import { cn } from '@/lib/utils';
import type { Lens } from '@/lib/supabase/types';

interface ArticleCardProps {
  title: string;
  slug: string;
  lens: Lens;
  excerpt: string;
  readingTime: number;
  publishedAt: string;
  coverImage?: string | null;
  coverImageAlt?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
}

export function ArticleCard({
  title,
  slug,
  lens,
  excerpt,
  readingTime,
  publishedAt,
  coverImage,
  coverImageAlt,
  isPremium = false,
  isFeatured = false,
}: ArticleCardProps) {
  const theme = getLensTheme(lens);
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className={cn('group card-media', theme.cardBorderTop, theme.hoverBorder)}>
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-bmj-black">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={coverImageAlt || title}
            fill
            className="halftone object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BrandMark size={48} color="var(--bmj-cream)" className="opacity-20" />
          </div>
        )}
        {isPremium && (
          <div className="absolute right-2 top-2 rounded-sm bg-bmj-black/80 p-1">
            <Lock size={12} className="text-bmj-amber" />
          </div>
        )}
        {isFeatured && (
          <div className="absolute left-2 top-2 border border-bmj-red bg-bmj-red/90 px-2 py-1 font-label text-micro uppercase tracking-label text-bmj-white">
            Featured
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <LensBadge lens={lens} className="mb-3 self-start" />

        <h3 className="mb-3 line-clamp-2 font-display text-xl uppercase tracking-display leading-tight text-bmj-white">
          <Link
            href={`/articles/${slug}`}
            className="text-bmj-white no-underline"
          >
            {title}
          </Link>
        </h3>

        <p className="line-clamp-2 flex-1 font-body text-sm leading-relaxed text-bmj-cream/70">
          {excerpt}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-bmj-tan/20 pt-4">
          <span className="font-label text-xs uppercase tracking-label text-bmj-cream/80">
            {Math.max(1, readingTime)} min read
          </span>
          <span className="font-mono text-xs uppercase tracking-label text-bmj-cream/80">{formattedDate}</span>
        </div>
      </div>
    </article>
  );
}
