import type { AdminMemberInsights, AdminSubscriberInsights } from '@/lib/admin-insights';

type AudienceBillingSectionProps = {
  members: AdminMemberInsights;
  subscribers: AdminSubscriberInsights;
};

export function AudienceBillingSection({
  members,
  subscribers,
}: AudienceBillingSectionProps) {
  return (
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
  );
}
