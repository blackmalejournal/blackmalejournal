import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllSubscribers } from '@/lib/supabase/admin-queries';

export const metadata: Metadata = {
  title: 'Subscribers — Admin',
  robots: { index: false, follow: false },
};

// ── Date formatter ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { label: 'All', value: undefined },
  { label: 'Active', value: 'active' },
  { label: 'Unsubscribed', value: 'unsubscribed' },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

interface SubscribersAdminPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function SubscribersAdminPage({
  searchParams,
}: SubscribersAdminPageProps) {
  const { filter } = await searchParams;

  const activeFilter =
    filter === 'active' ? true : filter === 'unsubscribed' ? false : undefined;

  const subscribers = await getAllSubscribers(
    activeFilter !== undefined ? { active: activeFilter } : undefined,
  );

  return (
    <div>
      {/* Page header */}
      <div>
        <h1 className="font-display text-3xl tracking-widest text-bmj-white">
          SUBSCRIBERS
        </h1>
        <p className="mt-1 font-mono text-sm text-bmj-tan">
          {subscribers.length}{' '}
          {subscribers.length === 1 ? 'subscriber' : 'subscribers'}
        </p>
      </div>

      {/* Filter tabs */}
      <nav
        aria-label="Subscriber filter"
        className="mt-6 flex gap-6 border-b border-bmj-tan/20"
      >
        {FILTER_TABS.map((tab) => {
          const isActive =
            filter === tab.value ||
            (tab.value === undefined && filter === undefined);
          return (
            <Link
              key={tab.label}
              href={
                tab.value ? `/admin/subscribers?filter=${tab.value}` : '/admin/subscribers'
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

      {/* Subscriber list */}
      <div className="mt-6">
        {subscribers.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No subscribers yet.
          </p>
        ) : (
          <ul>
            {subscribers.map((subscriber) => (
              <li
                key={subscriber.id}
                className="flex items-center justify-between border-b border-bmj-tan/10 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-bmj-cream">
                    {subscriber.email}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    {subscriber.source && (
                      <span className="font-mono text-xs text-bmj-tan/50">
                        {subscriber.source}
                      </span>
                    )}
                    <span className="font-mono text-xs text-bmj-tan">
                      Subscribed {formatDate(subscriber.subscribed_at)}
                    </span>
                    {subscriber.unsubscribed_at && (
                      <span className="font-mono text-xs text-bmj-red">
                        Unsubscribed {formatDate(subscriber.unsubscribed_at)}
                      </span>
                    )}
                  </div>
                </div>
                {subscriber.unsubscribed_at && (
                  <span className="ml-4 shrink-0 px-2 py-0.5 font-label text-[10px] uppercase tracking-widest text-bmj-red">
                    Unsubscribed
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
