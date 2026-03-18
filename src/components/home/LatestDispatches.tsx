// src/components/home/LatestDispatches.tsx
import Link from 'next/link';
import { StarDivider } from '@/components/ui/StarDivider';
import { DispatchCard } from '@/components/content/DispatchCard';
import type { Dispatch } from '@/lib/supabase/types';

interface LatestDispatchesProps {
  dispatches: Dispatch[];
}

export function LatestDispatches({ dispatches }: LatestDispatchesProps) {
  return (
    <section className="bg-bmj-black py-20">
      <div className="mx-auto max-w-content px-6">
        <StarDivider className="mb-8" />

        <h2 className="mb-12 text-center font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
          Latest Dispatches
        </h2>

        {dispatches.length > 0 ? (
          <div className="mx-auto max-w-article space-y-4">
            {dispatches.map((dispatch) => (
              <DispatchCard
                key={dispatch.id}
                title={dispatch.title}
                slug={dispatch.slug}
                lens={dispatch.lens}
                excerpt={dispatch.excerpt}
                publishedAt={dispatch.published_at}
              />
            ))}
          </div>
        ) : (
          <p className="text-center font-body text-base text-bmj-cream/50">
            Dispatches coming soon.
          </p>
        )}

        {dispatches.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="inline-block border border-bmj-tan/40 px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
            >
              All Dispatches &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
