'use client';

import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-6 py-24 text-center">
      <BrandMark size={48} color="var(--bmj-red)" className="mb-8 opacity-40" />

      <p className="mb-4 font-mono text-xs uppercase tracking-label-max text-bmj-tan">
        Portal Error
      </p>

      <h1 className="mb-6 font-display text-5xl leading-none text-bmj-white sm:text-7xl">
        ACCESS INTERRUPTED
      </h1>

      <div className="mx-auto mb-8 h-[3px] w-24 bg-bmj-red" />

      <p className="mx-auto mb-12 max-w-md font-body text-lg leading-relaxed text-bmj-cream/70">
        Something went wrong loading this page. Try again or return to your portal.
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <button
          onClick={reset}
          className="border border-bmj-red bg-bmj-red/10 px-6 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:bg-bmj-red hover:text-bmj-white"
        >
          Try Again
        </button>
        <Link
          href="/portal"
          className="inline-block border border-bmj-tan/40 px-6 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Back to Portal
        </Link>
      </div>
    </div>
  );
}
