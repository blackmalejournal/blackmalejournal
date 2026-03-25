import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { AdminMetricCard } from '@/components/admin/AdminMetricCard';
import { getAdminCommandCenterSnapshot } from '@/lib/supabase/admin-queries';
import { StarDivider } from '@/components/ui/StarDivider';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

const contentLabels = {
  article: 'Article',
  briefing: 'Briefing',
  dispatch: 'Dispatch',
  handbook: 'Handbook',
} as const;

function formatDate(iso: string | null): string {
  if (!iso) return 'No date set';

  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function AdminDashboardPage() {
  const snapshot = await getAdminCommandCenterSnapshot();
  const { counts, pipeline, activity, members, messages, subscribers } = snapshot;

  const contentCards = [
    {
      label: 'Articles',
      total: counts.articles.total,
      detail: `${counts.articles.published} published · ${counts.articles.draft} draft`,
      href: '/admin/articles',
    },
    {
      label: 'Briefings',
      total: counts.briefings.total,
      detail: `${counts.briefings.published} published · ${counts.briefings.draft} draft`,
      href: '/admin/briefings',
    },
    {
      label: 'Courses',
      total: counts.courses.total,
      detail: `${counts.courses.published} published · ${counts.courses.draft} draft`,
      href: '/admin/courses',
    },
    {
      label: 'Dispatches',
      total: counts.dispatches.total,
      detail: `${counts.dispatches.published} published · ${counts.dispatches.draft} draft`,
      href: '/admin/dispatches',
    },
    {
      label: 'Downloads',
      total: counts.downloads.total,
      detail: 'Resource inventory',
      href: '/admin/downloads',
    },
    {
      label: 'Handbooks',
      total: counts.handbooks.total,
      detail: `${counts.handbooks.published} published · ${counts.handbooks.draft} draft`,
      href: '/admin/handbooks',
    },
    {
      label: 'Members',
      total: counts.members.total,
      detail: `${members.paying} paying · ${members.billingExceptions} billing exceptions`,
      href: '/admin/members',
    },
    {
      label: 'Messages',
      total: counts.messages.total,
      detail: `${messages.unresolvedCount} unresolved · ${messages.overdueCount} overdue`,
      href: '/admin/messages',
    },
    {
      label: 'Subscribers',
      total: counts.subscribers.total,
      detail: `${subscribers.active} active · ${subscribers.netPast30Days >= 0 ? '+' : ''}${subscribers.netPast30Days} net 30d`,
      href: '/admin/subscribers',
    },
  ] as const;

  const attentionItems = [
    messages.overdueCount > 0
      ? {
          label: 'Inbox backlog',
          detail: `${messages.overdueCount} messages are older than 3 days and still unresolved.`,
          href: '/admin/messages',
          tone: 'critical' as const,
        }
      : null,
    pipeline.staleQueue.length > 0
      ? {
          label: 'Editorial backlog',
          detail: `${pipeline.staleQueue.length} content items are stale or have missed their scheduled window.`,
          href: pipeline.staleQueue[0]?.href ?? '/admin/articles',
          tone: 'critical' as const,
        }
      : null,
    members.billingExceptions > 0
      ? {
          label: 'Billing review',
          detail: `${members.billingExceptions} paying members are missing Stripe reference coverage.`,
          href: '/admin/members',
          tone: 'warning' as const,
        }
      : null,
    subscribers.netPast30Days < 0
      ? {
          label: 'Audience churn',
          detail: `Net subscriber movement is ${subscribers.netPast30Days} over the last 30 days.`,
          href: '/admin/subscribers',
          tone: 'warning' as const,
        }
      : null,
  ].filter(
    (
      item,
    ): item is {
      label: string;
      detail: string;
      href: string;
      tone: 'critical' | 'warning';
    } => item !== null,
  );

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl tracking-widest text-bmj-white">
          DASHBOARD
        </h1>
        <p className="mt-2 max-w-3xl font-body text-sm text-bmj-cream/75">
          Owner command center for publishing, audience, billing follow-up, and
          inbox pressure.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard
          label="Inbox Pressure"
          value={messages.unresolvedCount}
          helper={`${messages.overdueCount} overdue · ${messages.newCount} new`}
          href="/admin/messages"
          tone={messages.overdueCount > 0 ? 'critical' : 'default'}
        />
        <AdminMetricCard
          label="Editorial Backlog"
          value={pipeline.staleQueue.length}
          helper={`${pipeline.statusCounts.draft} drafts · ${pipeline.statusCounts.review} in review`}
          href={pipeline.staleQueue[0]?.href ?? '/admin/articles'}
          tone={pipeline.staleQueue.length > 0 ? 'critical' : 'default'}
        />
        <AdminMetricCard
          label="Scheduled This Week"
          value={pipeline.scheduledThisWeek}
          helper={`${pipeline.statusCounts.scheduled} total scheduled`}
          href={pipeline.scheduledQueue[0]?.href ?? '/admin/briefings'}
          tone={pipeline.scheduledThisWeek > 0 ? 'warning' : 'default'}
        />
        <AdminMetricCard
          label="Paying Members"
          value={members.paying}
          helper={`${members.billingExceptions} need billing review`}
          href="/admin/members"
          tone={members.billingExceptions > 0 ? 'warning' : 'default'}
        />
        <AdminMetricCard
          label="Active Subscribers"
          value={subscribers.active}
          helper={`${subscribers.netPast30Days >= 0 ? '+' : ''}${subscribers.netPast30Days} net over 30 days`}
          href="/admin/subscribers"
          tone={subscribers.netPast30Days < 0 ? 'warning' : 'success'}
        />
        <AdminMetricCard
          label="New Members 30d"
          value={members.joinedPast30Days}
          helper={`${members.admins} admins · ${members.editors} editors`}
          href="/admin/members"
          tone="default"
        />
      </div>

      <StarDivider className="my-6" />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-bmj-tan/20 bg-bmj-brown p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl tracking-widest text-bmj-white">
                ATTENTION QUEUE
              </h2>
              <p className="mt-1 font-body text-sm text-bmj-cream/70">
                Resolve these items before adding new content.
              </p>
            </div>
            <Link
              href="/admin/messages"
              className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
            >
              Open Inbox
              <ArrowRight size={14} />
            </Link>
          </div>

          {attentionItems.length === 0 ? (
            <p className="mt-6 border border-[#416100]/30 bg-[#416100]/10 p-4 font-body text-sm text-bmj-cream/80">
              No urgent admin blockers are visible right now. The inbox is under
              control and there are no stale editorial or billing exceptions in
              the current snapshot.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {attentionItems.map((item) => (
                <li
                  key={item.label}
                  className={`border p-4 ${
                    item.tone === 'critical'
                      ? 'border-bmj-red/30 bg-bmj-red/10'
                      : 'border-bmj-amber/30 bg-bmj-amber/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-label text-xs uppercase tracking-widest text-bmj-white">
                        {item.label}
                      </p>
                      <p className="mt-2 font-body text-sm text-bmj-cream/80">
                        {item.detail}
                      </p>
                    </div>
                    <Link
                      href={item.href}
                      className="shrink-0 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
                    >
                      Resolve
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-bmj-tan/20 bg-bmj-brown p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl tracking-widest text-bmj-white">
                PUBLISHING QUEUE
              </h2>
              <p className="mt-1 font-body text-sm text-bmj-cream/70">
                Upcoming scheduled items across the editorial stack.
              </p>
            </div>
            <Link
              href="/admin/articles"
              className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
            >
              View Content
              <ArrowRight size={14} />
            </Link>
          </div>

          {pipeline.scheduledQueue.length === 0 ? (
            <p className="mt-6 border border-bmj-tan/20 bg-bmj-black/30 p-4 font-body text-sm text-bmj-cream/70">
              No scheduled items are currently queued.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {pipeline.scheduledQueue.map((item) => (
                <li key={item.id} className="border border-bmj-tan/20 bg-bmj-black/25 p-4">
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
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-label text-micro uppercase tracking-widest text-bmj-amber">
                        Scheduled
                      </p>
                      <p className="mt-2 font-mono text-sm text-bmj-white">
                        {formatDate(item.scheduledFor)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
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
              href="/admin/articles"
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

        <div className="space-y-6">
          <section className="border border-bmj-tan/20 bg-bmj-brown p-6">
            <h2 className="font-display text-xl tracking-widest text-bmj-white">
              AUDIENCE AND BILLING
            </h2>
            <div className="mt-4 space-y-4">
              <div className="border border-bmj-tan/20 bg-bmj-black/25 p-4">
                <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                  Member Health
                </p>
                <p className="mt-2 font-body text-sm text-bmj-cream/80">
                  {members.basic} basic and {members.premium} premium members are
                  currently active. {members.billingExceptions} paying members need
                  Stripe reference review.
                </p>
              </div>
              <div className="border border-bmj-tan/20 bg-bmj-black/25 p-4">
                <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                  Audience Motion
                </p>
                <p className="mt-2 font-body text-sm text-bmj-cream/80">
                  {subscribers.newPast30Days} new subscribers and {subscribers.churnPast30Days}{' '}
                  unsubscribes were recorded in the last 30 days.
                </p>
              </div>
            </div>
          </section>

          <section className="border border-bmj-tan/20 bg-bmj-brown p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl tracking-widest text-bmj-white">
                  RECENT EDITORIAL ACTIVITY
                </h2>
                <p className="mt-1 font-body text-sm text-bmj-cream/70">
                  The latest content moves across the publishing stack.
                </p>
              </div>
              <Link
                href="/admin/articles"
                className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
              >
                Content Desk
                <ArrowRight size={14} />
              </Link>
            </div>

            {activity.length === 0 ? (
              <p className="mt-4 border border-bmj-tan/20 bg-bmj-black/30 p-4 font-body text-sm text-bmj-cream/70">
                No recent editorial activity is visible yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {activity.map((item) => (
                  <li
                    key={`${item.id}-${item.label}`}
                    className="border border-bmj-tan/20 bg-bmj-black/25 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                          {item.label} · {contentLabels[item.entity]}
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
                      </div>
                      <p className="shrink-0 font-mono text-xs text-bmj-cream/70">
                        {formatDate(item.happenedAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-bmj-tan/20 bg-bmj-brown p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl tracking-widest text-bmj-white">
                TOP SOURCES
              </h2>
              <Link
                href="/admin/subscribers"
                className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
              >
                Subscriber Desk
                <ArrowRight size={14} />
              </Link>
            </div>

            {subscribers.topSources.length === 0 ? (
              <p className="mt-4 font-body text-sm text-bmj-cream/70">
                Subscriber source data is not populated yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {subscribers.topSources.map((source) => (
                  <li
                    key={source.source}
                    className="flex items-center justify-between border border-bmj-tan/20 bg-bmj-black/25 px-4 py-3"
                  >
                    <span className="font-mono text-sm text-bmj-cream">
                      {source.source}
                    </span>
                    <span className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                      {source.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <StarDivider className="my-6" />

      <section aria-labelledby="coverage-heading">
        <h2
          id="coverage-heading"
          className="font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Admin Coverage
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {contentCards.map((card) => (
            <AdminMetricCard
              key={card.label}
              label={card.label}
              value={card.total}
              helper={card.detail}
              href={card.href}
            />
          ))}
        </div>
      </section>

      <StarDivider className="my-6" />

      <section aria-labelledby="actions-heading">
        <h2
          id="actions-heading"
          className="font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Quick Actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
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
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-tan/70"
          >
            <Plus size={16} />
            New Course
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
