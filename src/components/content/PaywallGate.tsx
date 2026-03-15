// src/components/content/PaywallGate.tsx
import Link from 'next/link';
import type { AccessTier } from '@/lib/supabase/types';

interface PaywallGateProps {
  requiredTier: AccessTier;
  previewBody: string;
}

export function PaywallGate({ requiredTier, previewBody }: PaywallGateProps) {
  const tierLabel = requiredTier === 'basic' ? 'Basic' : 'Premium';

  return (
    <div>
      {/* Preview text */}
      <div className="relative">
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/90">
          {previewBody}
          <span aria-hidden="true">…</span>
        </p>
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent to-bmj-black"
          aria-hidden="true"
        />
      </div>

      {/* CTA */}
      <div className="mt-8 border border-bmj-red/40 bg-bmj-brown p-8 text-center">
        <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Members Only
        </p>
        <h3 className="mb-4 font-display text-2xl text-bmj-white">
          This article is for {tierLabel} members
        </h3>
        <p className="mb-6 font-body text-sm text-bmj-cream/70">
          Upgrade to read the full article and all {tierLabel.toLowerCase()} content.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/signup?tier=${requiredTier}`}
            className="inline-block bg-bmj-red px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-85"
          >
            Subscribe — {tierLabel}
          </Link>
          <Link
            href="/login"
            className="font-body text-sm text-bmj-tan underline hover:text-bmj-cream"
          >
            Already a member? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
