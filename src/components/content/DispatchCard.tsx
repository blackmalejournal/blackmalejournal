import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { LensBadge } from '@/components/brand/LensBadge';
import type { Lens } from '@/lib/supabase/types';

interface DispatchCardProps {
  title: string;
  slug: string;
  lens: Lens;
  excerpt: string;
  publishedAt: string;
}

export function DispatchCard({
  title,
  slug,
  lens,
  excerpt,
  publishedAt,
}: DispatchCardProps) {
  return (
    <article className="group border-l-4 border-bmj-red bg-bmj-brown transition-colors duration-200 hover:border-bmj-cream">
      <Link
        href={`/blog/${slug}`}
        className="block p-6 no-underline sm:p-8"
        aria-label={title}
      >
        <div className="mb-3 flex items-center gap-4">
          <LensBadge lens={lens} />
          <span className="font-mono text-xs text-bmj-cream/80">
            {formatDate(publishedAt)}
          </span>
        </div>

        <h3 className="mb-3 font-display text-2xl leading-tight text-bmj-white sm:text-3xl">
          {title}
        </h3>

        <p className="line-clamp-2 font-body text-sm leading-relaxed text-bmj-cream/70">
          {excerpt}
        </p>
      </Link>
    </article>
  );
}
