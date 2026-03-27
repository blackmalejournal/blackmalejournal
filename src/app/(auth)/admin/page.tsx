import type { Metadata } from 'next';
import { PATHS } from '@/lib/paths';
import { getAdminCommandCenterSnapshot } from '@/lib/supabase/admin-queries';
import { StarDivider } from '@/components/ui/StarDivider';
import {
  KeyMetricsGrid,
  AttentionQueueSection,
  PublishingQueueSection,
  EditorialPipelineSection,
  AudienceBillingSection,
  RecentActivitySection,
  TopSourcesSection,
  AdminCoverageSection,
  QuickActionsSection,
  type AttentionItem,
} from '@/components/admin/dashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const snapshot = await getAdminCommandCenterSnapshot();
  const { counts, pipeline, activity, members, messages, subscribers } = snapshot;

  const contentCards = [
    {
      label: 'Articles',
      total: counts.articles.total,
      detail: `${counts.articles.published} published · ${counts.articles.draft} draft`,
      href: PATHS.ADMIN_ARTICLES,
    },
    {
      label: 'Briefings',
      total: counts.briefings.total,
      detail: `${counts.briefings.published} published · ${counts.briefings.draft} draft`,
      href: PATHS.ADMIN_BRIEFINGS,
    },
    {
      label: 'Courses',
      total: counts.courses.total,
      detail: `${counts.courses.published} published · ${counts.courses.draft} draft`,
      href: PATHS.ADMIN_COURSES,
    },
    {
      label: 'Dispatches',
      total: counts.dispatches.total,
      detail: `${counts.dispatches.published} published · ${counts.dispatches.draft} draft`,
      href: PATHS.ADMIN_DISPATCHES,
    },
    {
      label: 'Downloads',
      total: counts.downloads.total,
      detail: 'Resource inventory',
      href: PATHS.ADMIN_DOWNLOADS,
    },
    {
      label: 'Handbooks',
      total: counts.handbooks.total,
      detail: `${counts.handbooks.published} published · ${counts.handbooks.draft} draft`,
      href: PATHS.ADMIN_HANDBOOKS,
    },
    {
      label: 'Members',
      total: counts.members.total,
      detail: `${members.paying} paying · ${members.billingExceptions} billing exceptions`,
      href: PATHS.ADMIN_MEMBERS,
    },
    {
      label: 'Messages',
      total: counts.messages.total,
      detail: `${messages.unresolvedCount} unresolved · ${messages.overdueCount} overdue`,
      href: PATHS.ADMIN_MESSAGES,
    },
    {
      label: 'Subscribers',
      total: counts.subscribers.total,
      detail: `${subscribers.active} active · ${subscribers.netPast30Days >= 0 ? '+' : ''}${subscribers.netPast30Days} net 30d`,
      href: PATHS.ADMIN_SUBSCRIBERS,
    },
  ] as const;

  const attentionItems: AttentionItem[] = [
    messages.overdueCount > 0
      ? {
          label: 'Inbox backlog',
          detail: `${messages.overdueCount} messages are older than 3 days and still unresolved.`,
          href: PATHS.ADMIN_MESSAGES as string,
          tone: 'critical' as const,
        }
      : null,
    pipeline.staleQueue.length > 0
      ? {
          label: 'Editorial backlog',
          detail: `${pipeline.staleQueue.length} content items are stale or have missed their scheduled window.`,
          href: pipeline.staleQueue[0]?.href ?? PATHS.ADMIN_ARTICLES,
          tone: 'critical' as const,
        }
      : null,
    members.billingExceptions > 0
      ? {
          label: 'Billing review',
          detail: `${members.billingExceptions} paying members are missing Stripe reference coverage.`,
          href: PATHS.ADMIN_MEMBERS as string,
          tone: 'warning' as const,
        }
      : null,
    subscribers.netPast30Days < 0
      ? {
          label: 'Audience churn',
          detail: `Net subscriber movement is ${subscribers.netPast30Days} over the last 30 days.`,
          href: PATHS.ADMIN_SUBSCRIBERS as string,
          tone: 'warning' as const,
        }
      : null,
  ].filter((item): item is AttentionItem => item !== null);

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

      <KeyMetricsGrid
        messages={messages}
        pipeline={pipeline}
        members={members}
        subscribers={subscribers}
      />

      <StarDivider className="my-6" />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AttentionQueueSection items={attentionItems} />
        <PublishingQueueSection scheduledQueue={pipeline.scheduledQueue} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <EditorialPipelineSection pipeline={pipeline} />

        <div className="space-y-6">
          <AudienceBillingSection members={members} subscribers={subscribers} />
          <RecentActivitySection activity={activity} />
          <TopSourcesSection topSources={subscribers.topSources} />
        </div>
      </div>

      <StarDivider className="my-6" />

      <AdminCoverageSection contentCards={contentCards} />

      <StarDivider className="my-6" />

      <QuickActionsSection />
    </div>
  );
}
