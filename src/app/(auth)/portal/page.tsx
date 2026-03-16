import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMemberById, getLatestArticles } from '@/lib/supabase/queries';
import { TierBadge } from '@/components/portal/TierBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { formatDate } from '@/lib/utils';
import type { MemberTier } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Member Portal',
};

const TIER_ACCESS: Record<MemberTier, string[]> = {
  free: [
    'Public articles',
    'Briefing previews',
    'Video gallery',
    'Academy',
  ],
  basic: [
    'Everything in Free',
    'Full briefing archive',
    'Select handbooks',
    'Member forum',
  ],
  premium: [
    'Everything in Basic',
    'All handbooks',
    'Downloads',
    'Private content',
    'Early access',
  ],
};

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const member = await getMemberById(user.id);
  const tier: MemberTier = member?.tier ?? 'free';
  const displayName =
    (user.user_metadata?.display_name as string) ||
    user.email?.split('@')[0] ||
    'Member';
  const memberSince = member?.created_at ?? user.created_at ?? '';

  const latestArticles = await getLatestArticles(5);

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-10">
        <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Member Portal
        </p>
        <h1 className="mb-4 font-display text-4xl text-bmj-white sm:text-5xl">
          WELCOME BACK, {displayName.toUpperCase()}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <TierBadge tier={tier} />
          {memberSince && (
            <span className="font-mono text-xs text-bmj-tan">
              Member since {formatDate(memberSince)}
            </span>
          )}
        </div>
      </div>

      <StarDivider />

      {/* Your Access */}
      <section className="py-10">
        <h2 className="mb-6 font-display text-2xl text-bmj-white">
          YOUR ACCESS
        </h2>
        <div className="border border-bmj-tan/20 bg-bmj-brown p-6">
          <ul className="space-y-2">
            {TIER_ACCESS[tier].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="text-bmj-red" aria-hidden="true">
                  ★
                </span>
                <span className="font-body text-sm text-bmj-cream">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Upgrade CTA */}
      {tier !== 'premium' && (
        <section className="mb-10 border border-bmj-red/30 bg-bmj-red/5 p-8 text-center">
          <h2 className="mb-2 font-display text-2xl text-bmj-white">
            UNLOCK MORE
          </h2>
          <p className="mb-4 font-body text-sm text-bmj-cream/70">
            {tier === 'free'
              ? 'Upgrade to Basic or Premium to access the full archive.'
              : 'Upgrade to Premium for complete access to everything.'}
          </p>
          <Link
            href="/signup?tier=premium"
            className="inline-block bg-bmj-red px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90"
          >
            Upgrade Now
          </Link>
        </section>
      )}

      {/* Latest content */}
      <section className="py-10">
        <h2 className="mb-6 font-display text-2xl text-bmj-white">
          LATEST FOR YOU
        </h2>
        <div className="space-y-4">
          {latestArticles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="block border-l-4 border-bmj-red bg-bmj-brown p-4 no-underline transition-colors hover:bg-bmj-brown/80"
            >
              <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                {article.lens}
              </p>
              <h3 className="font-display text-xl text-bmj-white">
                {article.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-bmj-tan/60">
                {formatDate(article.published_at)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <StarDivider />

      {/* Quick links */}
      <div className="flex flex-wrap gap-4 py-10">
        <Link
          href="/portal/settings"
          className="border border-bmj-tan/30 px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream no-underline transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Settings
        </Link>
        <Link
          href="/briefings"
          className="border border-bmj-tan/30 px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream no-underline transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Briefings
        </Link>
        <Link
          href="/academy"
          className="border border-bmj-tan/30 px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream no-underline transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Academy
        </Link>
      </div>
    </div>
  );
}
