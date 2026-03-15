// src/components/home/BriefingPreview.tsx
import { StarDivider } from "@/components/ui/StarDivider";
import { BriefingCard } from "@/components/content/BriefingCard";
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
          <div className="mx-auto max-w-article">
            <BriefingCard briefing={briefing} />
          </div>
        ) : (
          <div className="mx-auto max-w-article border border-bmj-tan/20 p-8 text-center">
            <p className="font-body text-base text-bmj-cream/50">
              The next briefing is in preparation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
