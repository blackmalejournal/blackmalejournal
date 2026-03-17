import Link from 'next/link';
import { Lock, Play, Clock } from 'lucide-react';

interface LessonCardProps {
  title: string;
  slug: string;
  courseSlug: string;
  orderNumber: number;
  duration: number;
  hasAccess: boolean;
  hasVideo?: boolean;
}

export function LessonCard({
  title,
  slug,
  courseSlug,
  orderNumber,
  duration,
  hasAccess,
  hasVideo = false,
}: LessonCardProps) {
  const paddedNumber = String(orderNumber).padStart(2, '0');

  const content = (
    <article
      className={[
        'flex items-center gap-4 border border-bmj-tan/20 bg-bmj-brown p-4 transition-colors',
        hasAccess ? 'hover:border-bmj-red/60' : 'opacity-70',
      ].join(' ')}
    >
      {/* Lesson number */}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-bmj-black font-mono text-sm text-bmj-tan">
        {paddedNumber}
      </span>

      {/* Title */}
      <div className="flex-1">
        <h3 className="font-display text-lg text-bmj-white">{title}</h3>
        <div className="mt-1 flex items-center gap-3">
          {hasVideo && (
            <span className="flex items-center gap-1 font-label text-xs uppercase tracking-widest text-bmj-amber">
              <Play size={10} />
              Video
            </span>
          )}
          {duration > 0 && (
            <span className="flex items-center gap-1 font-mono text-xs text-bmj-cream/80">
              <Clock size={10} />
              {duration} min
            </span>
          )}
        </div>
      </div>

      {/* Access indicator */}
      <div className="shrink-0">
        {hasAccess ? (
          <span className="font-label text-xs uppercase tracking-widest text-bmj-cream/40">
            &rarr;
          </span>
        ) : (
          <Lock size={16} className="text-bmj-amber" />
        )}
      </div>
    </article>
  );

  if (!hasAccess) return content;

  return (
    <Link
      href={`/academy/${courseSlug}/${slug}`}
      className="no-underline"
    >
      {content}
    </Link>
  );
}
