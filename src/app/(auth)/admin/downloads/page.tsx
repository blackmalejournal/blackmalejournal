import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getAllDownloads } from '@/lib/supabase/admin-queries';
import type { AccessTier } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Downloads — Admin',
  robots: { index: false, follow: false },
};

// ── Access tier badge ──────────────────────────────────────────────────────────

const tierStyles: Record<AccessTier, string> = {
  free: 'bg-bmj-tan/20 text-bmj-tan',
  basic: 'bg-bmj-amber/20 text-bmj-amber',
  premium: 'bg-bmj-red/20 text-bmj-red',
};

function TierBadge({ tier }: { tier: AccessTier }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-label text-[10px] uppercase tracking-widest ${tierStyles[tier]}`}
    >
      {tier}
    </span>
  );
}

// ── File size formatter ────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Date formatter ─────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Category tabs ──────────────────────────────────────────────────────────────

const CATEGORY_TABS: { label: string; value: string | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Template', value: 'template' },
  { label: 'Worksheet', value: 'worksheet' },
  { label: 'Handbook', value: 'handbook' },
];

// ── Page ───────────────────────────────────────────────────────────────────────

interface DownloadsAdminPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function DownloadsAdminPage({
  searchParams,
}: DownloadsAdminPageProps) {
  const { category } = await searchParams;

  const activeCategory = category?.trim() || undefined;

  const downloads = await getAllDownloads(
    activeCategory ? { category: activeCategory } : undefined,
  );

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-bmj-white">
            DOWNLOADS
          </h1>
          <p className="mt-1 font-mono text-sm text-bmj-tan">
            {downloads.length} {downloads.length === 1 ? 'download' : 'downloads'}
          </p>
        </div>
        <Link
          href="/admin/downloads/new"
          className="inline-flex items-center gap-2 bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Download
        </Link>
      </div>

      {/* Category filter tabs */}
      <nav
        aria-label="Category filter"
        className="mt-6 flex gap-6 border-b border-bmj-tan/20"
      >
        {CATEGORY_TABS.map((tab) => {
          const isActive =
            activeCategory === tab.value ||
            (tab.value === undefined && activeCategory === undefined);
          return (
            <Link
              key={tab.label}
              href={
                tab.value
                  ? `/admin/downloads?category=${tab.value}`
                  : '/admin/downloads'
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

      {/* Download list */}
      <div className="mt-6">
        {downloads.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No downloads found. Create your first download.
          </p>
        ) : (
          <ul>
            {downloads.map((download) => (
              <li
                key={download.id}
                className="flex items-center justify-between border-b border-bmj-tan/10 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <TierBadge tier={download.access_tier} />
                    <h2 className="truncate font-display text-lg text-bmj-white">
                      {download.title}
                    </h2>
                  </div>
                  <p className="mt-1 pl-0 font-mono text-xs text-bmj-tan">
                    {download.category} &middot;{' '}
                    {download.file_type.toUpperCase()} &middot;{' '}
                    {formatFileSize(download.file_size)} &middot;{' '}
                    {formatDate(download.created_at)}
                  </p>
                </div>
                <Link
                  href={`/admin/downloads/${download.id}/edit`}
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
