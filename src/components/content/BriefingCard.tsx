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
    <article className="group relative border-l-4 border-bmj-red bg-bmj-brown transition-colors duration-200 hover:bg-bmj-brown/80">
      <Link
        href={`/briefings/${briefing.slug}`}
        className="block p-6 no-underline sm:p-8"
      >
        {/* Issue + date row */}
        <div className="mb-3 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-bmj-tan">
            {issueLabel}
          </span>
          <span className="font-mono text-xs text-bmj-tan/60">
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
        <h3 className="mb-3 font-display text-3xl leading-tight text-bmj-white transition-opacity group-hover:opacity-80 sm:text-4xl">
          {briefing.title}
        </h3>

        {/* First section title as preview */}
        {previewText && (
          <p className="font-label text-sm uppercase tracking-wider text-bmj-tan/70">
            {previewText}
          </p>
        )}
      </Link>
    </article>
  );
}
