import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { getBriefings } from '@/lib/supabase/queries';
import { StarDivider } from '@/components/ui/StarDivider';
import { BriefingCard } from '@/components/content/BriefingCard';

export const metadata: Metadata = {
  title: 'Weekend Briefing',
  description:
    'A weekly dispatch on the politics, philosophy, and health of the Black male experience.',
};

const PAGE_SIZE = 10;

interface BriefingsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BriefingsPage({ searchParams }: BriefingsPageProps) {
  const { page: rawPage } = await searchParams;
  const parsedPage = parseInt(rawPage ?? '1', 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);

  // Fetch one extra to detect if more pages exist
  const briefings = await getBriefings({ limit: PAGE_SIZE * page + 1, offset: 0 });

  const hasMore = briefings.length > PAGE_SIZE * page;
  const visible = briefings.slice(0, PAGE_SIZE * page);

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-2 flex items-center gap-3">
        <BookOpen size={28} className="text-bmj-red" aria-hidden="true" />
        <h1 className="font-display text-5xl text-bmj-white">
          Weekend Briefing
        </h1>
      </div>

      <p className="mb-4 font-body text-base italic text-bmj-tan">
        A weekly dispatch on the politics, philosophy, and health of the Black male experience.
      </p>

      <StarDivider className="mb-12" />

      {/* Briefing list */}
      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-label text-bmj-tan">No briefings published yet.</p>
          <p className="mt-2 font-body text-sm text-bmj-tan/60">
            The first dispatch is being prepared.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {visible.map((briefing) => (
              <BriefingCard key={briefing.id} briefing={briefing} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <Link
                href={`/briefings?page=${page + 1}`}
                className="inline-block border border-bmj-tan/40 px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
              >
                Load More
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
