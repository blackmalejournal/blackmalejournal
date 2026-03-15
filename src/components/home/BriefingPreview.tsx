// src/components/home/BriefingPreview.tsx
import Link from "next/link";
import { StarDivider } from "@/components/ui/StarDivider";
import { formatDate } from "@/lib/utils";
import type { Briefing } from "@/lib/supabase/types";

interface BriefingPreviewProps {
  briefing: Briefing | null;
}

export function BriefingPreview({ briefing }: BriefingPreviewProps) {
  return (
    <section className="bg-bmj-brown py-20">
      <div className="mx-auto max-w-content px-6">
        <StarDivider className="mb-8" />

        <h2 className="mb-12 text-center font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
          Latest Briefing
        </h2>

        {briefing ? (
          <div className="mx-auto max-w-article border border-bmj-tan/20 p-8 md:p-12">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-bmj-tan">
              Issue #{String(briefing.issue_number).padStart(3, "0")}
              &nbsp;&nbsp;·&nbsp;&nbsp;
              {formatDate(briefing.published_at)}
            </p>

            <h3 className="font-display text-4xl leading-tight text-bmj-white md:text-5xl">
              {briefing.title}
            </h3>

            <div className="my-6 h-px w-16 bg-bmj-red" />

            {briefing.sections[0] && (
              <p className="font-body text-base leading-relaxed text-bmj-cream/80">
                {briefing.sections[0].body}
              </p>
            )}

            <Link
              href={`/briefings/${briefing.slug}`}
              className="mt-8 inline-block font-label text-sm uppercase tracking-widest text-bmj-red no-underline transition-opacity hover:opacity-75"
            >
              Read Full Briefing →
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-article border border-bmj-tan/20 p-8 text-center md:p-12">
            <p className="font-body text-base text-bmj-cream/50">
              The next briefing is in preparation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
