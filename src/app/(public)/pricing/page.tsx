import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';
import { CheckoutButton } from '@/components/portal/CheckoutButton';
import { StarDivider } from '@/components/ui/StarDivider';
import type { MemberTier } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Pricing',
};

const TIERS = [
  {
    name: 'BASIC' as const,
    tier: 'basic' as const,
    price: '$9',
    interval: '/month',
    description: 'Full access to the archive and community.',
    features: [
      'Everything in Free',
      'Full Weekend Briefing archive',
      'Select handbooks',
      'Member forum access',
    ],
    border: 'border-bmj-amber',
    accent: 'text-bmj-amber',
    buttonBg: 'bg-bmj-amber',
  },
  {
    name: 'PREMIUM' as const,
    tier: 'premium' as const,
    price: '$19',
    interval: '/month',
    description: 'Complete access. Everything we build, you get.',
    features: [
      'Everything in Basic',
      'All handbooks and downloads',
      'Private content',
      'Early access to new features',
      'Direct line to The Chairman',
    ],
    border: 'border-bmj-red',
    accent: 'text-bmj-red',
    buttonBg: 'bg-bmj-red',
  },
] as const;

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentTier: MemberTier = 'free';
  if (user) {
    const member = await getMemberById(user.id);
    currentTier = member?.tier ?? 'free';
  }

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Membership
        </p>
        <h1 className="mb-4 font-display text-5xl text-bmj-white sm:text-6xl">
          JOIN THE MOVEMENT
        </h1>
        <p className="mx-auto max-w-xl font-body text-sm leading-relaxed text-bmj-cream/70">
          Free members get public articles, briefing previews, the video gallery, and
          the academy. Upgrade for the full experience.
        </p>
      </div>

      <StarDivider />

      <div className="mx-auto mt-12 grid max-w-3xl gap-8 md:grid-cols-2">
        {TIERS.map((t) => {
          const isCurrent = currentTier === t.tier;
          return (
            <div
              key={t.tier}
              className={`border ${t.border} bg-bmj-brown p-8 ${
                isCurrent ? 'ring-2 ring-bmj-white/20' : ''
              }`}
            >
              <h2 className={`mb-1 font-display text-3xl ${t.accent}`}>
                {t.name}
              </h2>
              <div className="mb-4 flex items-baseline gap-1">
                <span className="font-display text-4xl text-bmj-white">
                  {t.price}
                </span>
                <span className="font-mono text-xs text-bmj-tan">
                  {t.interval}
                </span>
              </div>
              <p className="mb-6 font-body text-sm text-bmj-cream/70">
                {t.description}
              </p>
              <ul className="mb-8 space-y-2">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 text-bmj-red" aria-hidden="true">
                      ★
                    </span>
                    <span className="font-body text-sm text-bmj-cream">{f}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span className="inline-block w-full border border-bmj-tan/30 px-6 py-3 text-center font-label text-xs uppercase tracking-widest text-bmj-tan">
                  Current Plan
                </span>
              ) : currentTier === 'premium' ? (
                <span className="inline-block w-full border border-bmj-tan/20 px-6 py-3 text-center font-label text-xs uppercase tracking-widest text-bmj-tan/40">
                  Included in Premium
                </span>
              ) : user ? (
                <CheckoutButton
                  tier={t.tier}
                  className={`w-full ${t.buttonBg} px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50`}
                >
                  Subscribe
                </CheckoutButton>
              ) : (
                <Link
                  href={`/signup?tier=${t.tier}`}
                  className={`block w-full ${t.buttonBg} px-6 py-3 text-center font-label text-xs uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90`}
                >
                  Get Started
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
