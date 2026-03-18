import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getContentCounts } from '@/lib/supabase/admin-queries';
import { StarDivider } from '@/components/ui/StarDivider';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const counts = await getContentCounts();

  const statCards = [
    {
      label: 'Articles',
      total: counts.articles.total,
      published: counts.articles.published,
      draft: counts.articles.draft,
      href: '/admin/articles',
    },
    {
      label: 'Briefings',
      total: counts.briefings.total,
      published: counts.briefings.published,
      draft: counts.briefings.draft,
      href: '/admin/briefings',
    },
    {
      label: 'Dispatches',
      total: counts.dispatches.total,
      published: counts.dispatches.published,
      draft: counts.dispatches.draft,
      href: '/admin/dispatches',
    },
    {
      label: 'Downloads',
      total: counts.downloads.total,
      published: null,
      draft: null,
      href: '/admin/downloads',
    },
    {
      label: 'Handbooks',
      total: counts.handbooks.total,
      published: counts.handbooks.published,
      draft: counts.handbooks.draft,
      href: '/admin/handbooks',
    },
    {
      label: 'Members',
      total: counts.members.total,
      published: null,
      draft: null,
      href: '/admin/members',
    },
    {
      label: 'Messages',
      total: counts.messages.total,
      published: null,
      draft: null,
      href: '/admin/messages',
    },
    {
      label: 'Subscribers',
      total: counts.subscribers.total,
      published: null,
      draft: null,
      href: '/admin/subscribers',
    },
  ] as const;

  return (
    <div>
      {/* Page header */}
      <h1 className="font-display text-3xl tracking-widest text-bmj-white">
        DASHBOARD
      </h1>
      <p className="mt-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
        Content overview
      </p>

      <StarDivider className="my-6" />

      {/* Content stats grid */}
      <section aria-labelledby="stats-heading">
        <h2
          id="stats-heading"
          className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Content Counts
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="block border border-bmj-tan/20 bg-bmj-brown p-6 transition-colors hover:border-bmj-tan/40"
            >
              <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                {card.label}
              </p>
              <p className="mt-3 font-mono text-3xl text-bmj-white">
                {card.total}
              </p>
              <p className="mt-1 font-mono text-xs text-bmj-tan">total</p>
              {card.published !== null && card.draft !== null && (
                <div className="mt-4 space-y-1 border-t border-bmj-tan/20 pt-4">
                  <p className="font-mono text-sm text-bmj-tan">
                    <span className="text-bmj-cream">{card.published}</span>{' '}
                    published
                  </p>
                  <p className="font-mono text-sm text-bmj-tan">
                    <span className="text-bmj-cream">{card.draft}</span> draft
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      <StarDivider className="my-6" />

      {/* Quick actions */}
      <section aria-labelledby="actions-heading">
        <h2
          id="actions-heading"
          className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            New Article
          </Link>
          <Link
            href="/admin/briefings/new"
            className="inline-flex items-center gap-2 border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-tan/70"
          >
            <Plus size={16} />
            New Briefing
          </Link>
          <Link
            href="/admin/dispatches/new"
            className="inline-flex items-center gap-2 border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-tan/70"
          >
            <Plus size={16} />
            New Dispatch
          </Link>
          <Link
            href="/admin/handbooks/new"
            className="inline-flex items-center gap-2 border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-tan/70"
          >
            <Plus size={16} />
            New Handbook
          </Link>
          <Link
            href="/admin/downloads/new"
            className="inline-flex items-center gap-2 border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-tan/70"
          >
            <Plus size={16} />
            New Download
          </Link>
        </div>
      </section>
    </div>
  );
}
