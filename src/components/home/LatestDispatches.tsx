// src/components/home/LatestDispatches.tsx
import Link from 'next/link';
import { DispatchCard } from '@/components/content/DispatchCard';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Dispatch } from '@/lib/supabase/types';

interface LatestDispatchesProps {
  dispatches: Dispatch[];
}

export function LatestDispatches({ dispatches }: LatestDispatchesProps) {
  return (
    <section className="bg-bmj-black py-20">
      <div className="page-shell-tight">
        <PageHeader
          as="h2"
          tone="section"
          align="center"
          title="Latest Dispatches"
          label="Field Notes"
          description="Short-form argument and rapid-response analysis from the running edge of the publication."
          dividerPosition="top"
          dividerClassName="mb-10"
        />

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
          <div className="section-empty-state">
            <p className="section-empty-state-text">Dispatches coming soon.</p>
          </div>
        )}

        {dispatches.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="btn-ghost"
            >
              All Dispatches &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
