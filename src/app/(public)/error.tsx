'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PublicError]', error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-6 py-24 text-center">
      <BrandMark size={48} color="var(--bmj-red)" className="mb-8 opacity-40" />

      <p className="mb-4 font-mono text-xs uppercase tracking-label-max text-bmj-tan">
        Something Went Wrong
      </p>

      <h1 className="mb-6 font-display text-5xl leading-none text-bmj-white sm:text-7xl">
        PAGE ERROR
      </h1>

      <div className="mx-auto mb-8 h-[3px] w-24 bg-bmj-red" />

      <p className="mx-auto mb-12 max-w-md font-body text-lg leading-relaxed text-bmj-cream/70">
        This page encountered an error. Try again or return to the homepage.
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <button onClick={reset} className="btn-ghost">
          Try Again
        </button>
        <Link href="/" className="btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
