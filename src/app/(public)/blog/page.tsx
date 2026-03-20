import type { Metadata } from 'next';
import Link from 'next/link';
import { getDispatches } from '@/lib/supabase/queries';
import { StarDivider } from '@/components/ui/StarDivider';
import { DispatchCard } from '@/components/content/DispatchCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Dispatches',
  description:
    'Short dispatches, updates, and commentary from The Chairman.',
  openGraph: {
    title: 'Dispatches',
    description:
      'Short dispatches, updates, and commentary from The Chairman.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dispatches',
    description:
      'Short dispatches, updates, and commentary from The Chairman.',
  },
};

const PAGE_SIZE = 10;

interface DispatchesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DispatchesPage({
  searchParams,
}: DispatchesPageProps) {
  const { page: rawPage } = await searchParams;
  const parsedPage = parseInt(rawPage ?? '1', 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);

  const dispatches = await getDispatches({
    limit: PAGE_SIZE * page + 1,
    offset: 0,
  });

  const hasMore = dispatches.length > PAGE_SIZE * page;
  const visible = dispatches.slice(0, PAGE_SIZE * page);

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl text-bmj-white">Dispatches</h1>
      <p className="mt-2 max-w-xl font-body text-lg text-bmj-cream/70">
        Short posts, updates, and commentary from The Chairman.
      </p>
      <StarDivider className="mb-12" />

      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-label text-bmj-tan">No dispatches yet.</p>
          <p className="mt-2 font-body text-sm text-bmj-tan">
            The first dispatch is being drafted.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {visible.map((dispatch) => (
              <DispatchCard
                key={dispatch.id}
                title={dispatch.title}
                slug={dispatch.slug}
                lens={dispatch.lens}
                excerpt={dispatch.excerpt}
                publishedAt={dispatch.published_at}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <Link
                href={`/blog?page=${page + 1}`}
                className="inline-block border border-bmj-tan/40 px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
              >
                Older Posts &rarr;
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
