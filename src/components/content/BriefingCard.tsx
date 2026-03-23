import Link from 'next/link';
import { Lock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Briefing } from '@/lib/supabase/types';

interface BriefingCardProps {
  briefing: Briefing;
}

export function BriefingCard({ briefing }: BriefingCardProps) {
  const issueLabel = `No. ${String(briefing.issue_number).padStart(3, '0')}`;
  const previewText = briefing.sections[0]?.title ?? '';
  const isPremium = briefing.access_tier !== 'free';

  return (
    <article className="group relative card-stripe border border-bmj-tan/15 border-l-bmj-red">
      <Link
        href={`/briefings/${briefing.slug}`}
        className="block p-6 no-underline sm:p-8"
        aria-label={briefing.title}
      >
        {/* Issue + date row */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-bmj-cream/80">
            {issueLabel}
          </span>
          <span className="font-mono text-xs text-bmj-cream/80">
            {formatDate(briefing.published_at)}
          </span>
          {isPremium && (
            <span className="ml-auto flex items-center gap-1 font-label text-xs uppercase tracking-widest text-bmj-amber">
              <Lock size={10} />
              Premium
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-3 font-display text-3xl uppercase tracking-display leading-tight text-bmj-white sm:text-4xl">
          {briefing.title}
        </h3>

        {/* First section title as preview */}
        {previewText && (
          <p className="font-label text-sm uppercase tracking-label text-bmj-cream/78">
            {previewText}
          </p>
        )}
      </Link>
    </article>
  );
}
