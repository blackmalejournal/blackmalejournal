import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';
import { BrandMark } from '@/components/brand/BrandMark';
import { StarDivider } from '@/components/ui/StarDivider';
import { withQuery } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Choose the membership tier that matches your access needs at The Black Male Journal.',
};

const PLANS = [
  {
    id: 'free',
    name: 'FREE',
    price: '$0',
    description: 'Start with the public archive and open academy material.',
    features: [
      'Public articles',
      'Briefing previews',
      'Video gallery',
      'Open academy access',
    ],
  },
  {
    id: 'basic',
    name: 'BASIC',
    price: '$9',
    description: 'Unlock the Weekend Briefing archive and member resources.',
    features: [
      'Everything in Free',
      'Full Weekend Briefing archive',
      'Select handbooks',
      'Member-only resource access',
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: '$19',
    description: 'Full access to every handbook, download, and private release.',
    features: [
      'Everything in Basic',
      'All handbooks and downloads',
      'Private content',
      'Early access to new releases',
    ],
  },
] as const;

interface PricingPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const member = user ? await getMemberById(user.id) : null;

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <div className="mb-4 flex items-center gap-4">
          <BrandMark size={32} color="var(--bmj-red)" />
          <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
            Membership
          </p>
        </div>
        <h1 className="font-display text-5xl text-bmj-white">CHOOSE YOUR ACCESS</h1>
        <p className="mt-4 max-w-2xl font-body text-lg leading-relaxed text-bmj-cream/80">
          BMJ is built as an archive, briefing organ, and disciplined learning platform.
          Choose the level of access that matches how deeply you want to enter the work.
        </p>
      </div>

      <StarDivider className="my-8" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrentPlan = member?.tier === plan.id;
          const href = user
            ? plan.id === 'free'
              ? '/portal'
              : withQuery('/portal/settings', {
                  upgrade: plan.id,
                  next,
                })
            : withQuery('/signup', {
                tier: plan.id === 'free' ? undefined : plan.id,
                next,
              });

          return (
            <section
              key={plan.id}
              className="flex h-full flex-col border border-bmj-tan/30 bg-bmj-brown p-8"
            >
              <p className="font-display text-3xl text-bmj-white">{plan.name}</p>
              <p className="mt-2 font-display text-5xl text-bmj-red">{plan.price}</p>
              <p className="mt-3 font-body text-sm leading-relaxed text-bmj-cream/75">
                {plan.description}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="text-bmj-red" aria-hidden="true">
                      ★
                    </span>
                    <span className="font-body text-sm text-bmj-cream/85">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                className={`mt-8 inline-flex items-center justify-center px-6 py-3 font-label text-xs uppercase tracking-widest transition-colors ${
                  isCurrentPlan
                    ? 'border border-bmj-tan/40 text-bmj-tan'
                    : plan.id === 'premium'
                      ? 'bg-bmj-red text-bmj-white hover:opacity-90'
                      : 'border border-bmj-tan/40 text-bmj-cream hover:border-bmj-red hover:text-bmj-white'
                }`}
              >
                {isCurrentPlan
                  ? 'Current Plan'
                  : user
                    ? plan.id === 'free'
                      ? 'Go to Portal'
                      : `Choose ${plan.name}`
                    : plan.id === 'free'
                      ? 'Create Free Account'
                      : `Join ${plan.name}`}
              </Link>
            </section>
          );
        })}
      </div>

      <StarDivider className="my-8" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="border border-bmj-tan/20 bg-bmj-brown p-8">
          <h2 className="font-display text-2xl text-bmj-white">WHAT YOU ARE FUNDING</h2>
          <p className="mt-4 font-body text-sm leading-relaxed text-bmj-cream/80">
            Membership supports independent editorial work, member resources, and the
            continued buildout of BMJ&apos;s archive, briefings, academy, and private
            releases.
          </p>
        </section>

        <section className="border border-bmj-tan/20 bg-bmj-brown p-8">
          <h2 className="font-display text-2xl text-bmj-white">FREQUENT QUESTIONS</h2>
          <div className="mt-4 space-y-4 font-body text-sm leading-relaxed text-bmj-cream/80">
            <p>
              <span className="font-label uppercase tracking-widest text-bmj-tan">
                Billing
              </span>{' '}
              Paid plans renew monthly and can be managed from the member portal.
            </p>
            <p>
              <span className="font-label uppercase tracking-widest text-bmj-tan">
                Upgrades
              </span>{' '}
              Moving from Basic to Premium happens inside the portal so members keep a
              single account and a single billing history.
            </p>
            <p>
              <span className="font-label uppercase tracking-widest text-bmj-tan">
                Access
              </span>{' '}
              Content marked Basic or Premium stays gated until the member tier is
              confirmed.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
