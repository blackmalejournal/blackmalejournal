import Link from 'next/link';
import Image from 'next/image';
import { Lock, BookOpen } from 'lucide-react';
import { LensBadge } from '@/components/brand/LensBadge';
import { formatDate } from '@/lib/utils';
import type { AccessTier, Lens } from '@/lib/supabase/types';

interface HandbookCardProps {
  title: string;
  slug: string;
  lens: Lens;
  description: string;
  accessTier: AccessTier;
  publishedAt: string;
  coverImage?: string | null;
}

export function HandbookCard({
  title,
  slug,
  lens,
  description,
  accessTier,
  publishedAt,
  coverImage,
}: HandbookCardProps) {
  const isPremium = accessTier !== 'free';

  return (
    <Link href={`/handbooks/${slug}`} className="group no-underline">
      <article className="flex flex-col border border-bmj-tan/20 bg-bmj-brown transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-bmj-red/60 sm:flex-row">
        {/* Cover image or icon */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-bmj-black sm:aspect-auto sm:w-48 sm:shrink-0">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="halftone object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen size={32} className="text-bmj-cream/10" aria-hidden="true" />
            </div>
          )}
          {isPremium && (
            <div className="absolute right-2 top-2">
              <Lock
                size={14}
                className="text-bmj-amber"
                data-testid="icon-Lock"
              />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center gap-3">
            <LensBadge lens={lens} />
            {isPremium && (
              <span className="font-label text-xs uppercase tracking-widest text-bmj-amber">
                {accessTier === 'premium' ? 'Premium' : 'Basic'}
              </span>
            )}
          </div>

          <h3 className="mb-2 font-display text-xl leading-tight text-bmj-white group-hover:text-bmj-cream">
            {title}
          </h3>

          <p className="line-clamp-2 flex-1 font-body text-sm leading-relaxed text-bmj-cream/70">
            {description}
          </p>

          <div className="mt-4 flex items-center border-t border-bmj-tan/20 pt-3">
            <span className="font-mono text-xs text-bmj-cream/80">
              {formatDate(publishedAt)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
