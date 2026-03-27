import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { AdminMetricCard } from '@/components/admin/AdminMetricCard';
import type { AdminPipelineInsights } from '@/lib/admin-insights';
import { contentLabels } from './utils';

type EditorialPipelineSectionProps = {
  pipeline: AdminPipelineInsights;
};

export function EditorialPipelineSection({
  pipeline,
}: EditorialPipelineSectionProps) {
  return (
    <section className="border border-bmj-tan/20 bg-bmj-brown p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl tracking-widest text-bmj-white">
            EDITORIAL PIPELINE
          </h2>
          <p className="mt-1 font-body text-sm text-bmj-cream/70">
            Status pressure across articles, briefings, dispatches, and handbooks.
          </p>
        </div>
        <Link
          href={PATHS.ADMIN_ARTICLES}
          className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
        >
          Manage Content
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminMetricCard
          label="Draft"
          value={pipeline.statusCounts.draft}
          helper="Needs editorial movement"
          tone={pipeline.statusCounts.draft > 0 ? 'warning' : 'default'}
        />
        <AdminMetricCard
          label="Review"
          value={pipeline.statusCounts.review}
          helper="Ready for decision"
          tone={pipeline.statusCounts.review > 0 ? 'warning' : 'default'}
        />
        <AdminMetricCard
          label="Scheduled"
          value={pipeline.statusCounts.scheduled}
          helper="Queued for release"
          tone={pipeline.statusCounts.scheduled > 0 ? 'success' : 'default'}
        />
        <AdminMetricCard
          label="Published"
          value={pipeline.statusCounts.published}
          helper="Live editorial inventory"
          tone="default"
        />
      </div>

      <div className="mt-6">
        <h3 className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Stale Or Missed Items
        </h3>
        {pipeline.staleQueue.length === 0 ? (
          <p className="mt-4 border border-bmj-tan/20 bg-bmj-black/30 p-4 font-body text-sm text-bmj-cream/70">
            No stale drafts or missed scheduled items are visible right now.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pipeline.staleQueue.map((item) => (
              <li
                key={item.id}
                className={`border p-4 ${
                  item.severity === 'critical'
                    ? 'border-bmj-red/30 bg-bmj-red/10'
                    : 'border-bmj-amber/30 bg-bmj-amber/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                      {contentLabels[item.entity]}
                    </p>
                    <Link
                      href={item.href}
                      className="mt-2 block font-display text-lg tracking-wider text-bmj-white transition-colors hover:text-bmj-red"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-2 font-mono text-xs text-bmj-tan">
                      {item.descriptor}
                    </p>
                    <p className="mt-2 font-body text-sm text-bmj-cream/80">
                      {item.reason}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-bmj-tan">
                    {item.ageInDays}d open
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
