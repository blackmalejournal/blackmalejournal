import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getAllDispatches } from '@/lib/supabase/admin-queries';
import type { ContentStatus } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Dispatches — Admin',
  robots: { index: false, follow: false },
};

// ── Status badge ────────────────────────────────────────────────────────────

const statusStyles: Record<ContentStatus, string> = {
  published: 'bg-bmj-red/20 text-bmj-red',
  draft: 'bg-bmj-tan/20 text-bmj-tan',
  review: 'bg-bmj-amber/20 text-bmj-amber',
  scheduled: 'bg-[#416100]/20 text-[#416100]',
  archived: 'bg-bmj-tan/10 text-bmj-tan/50',
  withdrawn: 'bg-bmj-crimson/20 text-bmj-crimson',
};

function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-label text-micro uppercase tracking-widest ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

// ── Lens label ──────────────────────────────────────────────────────────────

const lensLabels: Record<string, string> = {
  health: 'Health',
  philosophy: 'Philosophy',
  politics: 'Politics',
};

// ── Date formatter ──────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Page ────────────────────────────────────────────────────────────────────

const STATUS_TABS: { label: string; value: string | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'draft' },
  { label: 'Review', value: 'review' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

interface DispatchesAdminPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function DispatchesAdminPage({
  searchParams,
}: DispatchesAdminPageProps) {
  const { status } = await searchParams;

  const validStatuses: ContentStatus[] = [
    'draft',
    'review',
    'scheduled',
    'published',
    'archived',
    'withdrawn',
  ];
  const activeStatus = validStatuses.includes(status as ContentStatus)
    ? (status as ContentStatus)
    : undefined;

  const dispatches = await getAllDispatches(
    activeStatus ? { status: activeStatus } : undefined,
  );

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-bmj-white">
            DISPATCHES
          </h1>
          <p className="mt-1 font-mono text-sm text-bmj-tan">
            {dispatches.length} {dispatches.length === 1 ? 'dispatch' : 'dispatches'}
          </p>
        </div>
        <Link
          href="/admin/dispatches/new"
          className="inline-flex items-center gap-2 bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Dispatch
        </Link>
      </div>

      {/* Status filter tabs */}
      <nav
        aria-label="Status filter"
        className="mt-6 flex gap-6 border-b border-bmj-tan/20"
      >
        {STATUS_TABS.map((tab) => {
          const isActive =
            activeStatus === tab.value ||
            (tab.value === undefined && activeStatus === undefined);
          return (
            <Link
              key={tab.label}
              href={
                tab.value
                  ? `/admin/dispatches?status=${tab.value}`
                  : '/admin/dispatches'
              }
              className={`pb-3 font-label text-xs uppercase tracking-widest transition-colors ${
                isActive
                  ? 'border-b-2 border-bmj-red text-bmj-white'
                  : 'text-bmj-tan hover:text-bmj-cream'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Dispatch list */}
      <div className="mt-6">
        {dispatches.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No dispatches found. Create your first dispatch.
          </p>
        ) : (
          <ul>
            {dispatches.map((dispatch) => (
              <li
                key={dispatch.id}
                className="flex items-center justify-between border-b border-bmj-tan/10 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={dispatch.status} />
                    <h2 className="truncate font-display text-lg text-bmj-white">
                      {dispatch.title}
                    </h2>
                  </div>
                  <p className="mt-1 pl-0 font-mono text-xs text-bmj-tan">
                    {lensLabels[dispatch.lens] ?? dispatch.lens} &middot;{' '}
                    {formatDate(dispatch.created_at)}
                  </p>
                </div>
                <Link
                  href={`/admin/dispatches/${dispatch.id}/edit`}
                  className="ml-4 shrink-0 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-red"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
