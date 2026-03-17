'use client';

import { useState } from 'react';
import type { MemberTier } from '@/lib/supabase/types';
import { TierBadge } from '@/components/portal/TierBadge';

interface SubscriptionManagerProps {
  tier: MemberTier;
  hasSubscription: boolean;
}

export function SubscriptionManager({
  tier,
  hasSubscription,
}: SubscriptionManagerProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);

  async function handleManageBilling() {
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/stripe/manage-billing', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Billing portal error:', err);
    } finally {
      setLoadingPortal(false);
    }
  }

  async function handleUpgrade() {
    setLoadingUpgrade(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'premium' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Upgrade error:', err);
    } finally {
      setLoadingUpgrade(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <TierBadge tier={tier} />
        <span className="font-body text-sm text-bmj-cream/70">Current plan</span>
      </div>

      {hasSubscription && (
        <p className="mt-2 font-mono text-xs text-bmj-tan">
          Subscription active
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {tier === 'basic' && (
          <button
            onClick={handleUpgrade}
            disabled={loadingUpgrade}
            className="bg-bmj-red px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loadingUpgrade ? 'Redirecting...' : 'Upgrade to Premium'}
          </button>
        )}

        {tier === 'free' && (
          <a
            href="/pricing"
            className="bg-bmj-red px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90"
          >
            View Plans
          </a>
        )}

        {hasSubscription && (
          <button
            onClick={handleManageBilling}
            disabled={loadingPortal}
            className="border border-bmj-tan/30 px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white disabled:opacity-50"
          >
            {loadingPortal ? 'Loading...' : 'Manage Billing'}
          </button>
        )}
      </div>
    </div>
  );
}
