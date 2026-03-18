import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllMembers, getMemberCount } from '@/lib/supabase/admin-queries';
import type { MemberTier, MemberRole } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Members — Admin',
  robots: { index: false, follow: false },
};

// ── Tier badge ───────────────────────────────────────────────────────────────

const tierStyles: Record<MemberTier, string> = {
  free: 'bg-bmj-tan/20 text-bmj-tan',
  basic: 'bg-bmj-amber/20 text-bmj-amber',
  premium: 'bg-bmj-red/20 text-bmj-red',
};

function TierBadge({ tier }: { tier: MemberTier }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-label text-[10px] uppercase tracking-widest ${tierStyles[tier]}`}
    >
      {tier}
    </span>
  );
}

// ── Role badge ───────────────────────────────────────────────────────────────

const roleStyles: Record<MemberRole, string> = {
  member: 'bg-bmj-tan/10 text-bmj-tan/70',
  editor: 'bg-bmj-amber/10 text-bmj-amber/70',
  admin: 'bg-bmj-red/10 text-bmj-red/70',
};

function RoleBadge({ role }: { role: MemberRole }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-label text-[10px] uppercase tracking-widest ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}

// ── Date formatter ──────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Page ────────────────────────────────────────────────────────────────────

const TIER_TABS: { label: string; value: string | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Free', value: 'free' },
  { label: 'Basic', value: 'basic' },
  { label: 'Premium', value: 'premium' },
];

interface MembersAdminPageProps {
  searchParams: Promise<{ tier?: string }>;
}

export default async function MembersAdminPage({
  searchParams,
}: MembersAdminPageProps) {
  const { tier } = await searchParams;

  const validTiers: MemberTier[] = ['free', 'basic', 'premium'];
  const activeTier = validTiers.includes(tier as MemberTier)
    ? (tier as MemberTier)
    : undefined;

  const [members, totalCount] = await Promise.all([
    getAllMembers(activeTier ? { tier: activeTier } : undefined),
    getMemberCount(),
  ]);

  return (
    <div>
      {/* Page header */}
      <div>
        <h1 className="font-display text-3xl tracking-widest text-bmj-white">
          MEMBERS
        </h1>
        <p className="mt-1 font-mono text-sm text-bmj-tan">
          {totalCount} {totalCount === 1 ? 'member' : 'members'} total
        </p>
      </div>

      {/* Tier filter tabs */}
      <nav
        aria-label="Tier filter"
        className="mt-6 flex gap-6 border-b border-bmj-tan/20"
      >
        {TIER_TABS.map((tab) => {
          const isActive =
            activeTier === tab.value ||
            (tab.value === undefined && activeTier === undefined);
          return (
            <Link
              key={tab.label}
              href={
                tab.value
                  ? `/admin/members?tier=${tab.value}`
                  : '/admin/members'
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

      {/* Member list */}
      <div className="mt-6">
        {members.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No members found.
          </p>
        ) : (
          <ul>
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between border-b border-bmj-tan/10 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <TierBadge tier={member.tier} />
                    <RoleBadge role={member.role} />
                    <p className="truncate font-mono text-sm text-bmj-cream">
                      {member.email}
                    </p>
                  </div>
                  <p className="mt-1 font-mono text-xs text-bmj-tan">
                    Joined {formatDate(member.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
