import Link from 'next/link';
import type { Metadata } from 'next';
import { BrandMark } from '@/components/brand/BrandMark';
import { PATHS } from '@/lib/paths';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
};

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-6 py-24 text-center">
      <BrandMark size={64} color="var(--bmj-red)" className="mb-8 opacity-40" />

      <p className="mb-4 font-mono text-xs uppercase tracking-label-max text-bmj-tan">
        Error 404
      </p>

      <h1 className="mb-6 font-display text-8xl leading-none text-bmj-white sm:text-[10rem]">
        404
      </h1>

      <div className="mx-auto mb-8 h-[3px] w-24 bg-bmj-red" />

      <p className="mx-auto mb-4 max-w-md font-body text-lg leading-relaxed text-bmj-cream/70">
        The page you seek does not exist in this archive. It may have been
        withdrawn, renamed, or never published.
      </p>

      <p className="mx-auto mb-12 max-w-md font-body text-sm text-bmj-tan/60">
        Every record has its place. This is not it.
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Link href={PATHS.HOME} className="btn-primary btn-lg">
          Return to the Front Page
        </Link>
        <Link
          href={PATHS.RECORDS}
          className="inline-block border border-bmj-tan/40 px-6 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Browse the Records
        </Link>
      </div>
    </div>
  );
}
