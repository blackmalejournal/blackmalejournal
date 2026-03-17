import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getHandbooks } from '@/lib/supabase/queries';
import { StarDivider } from '@/components/ui/StarDivider';
import { HandbookCard } from '@/components/content/HandbookCard';
import { LensFilterTabs } from '@/components/content/LensFilterTabs';
import type { Lens } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Handbooks',
  description:
    'Field manuals for the disciplined man. Long-form guides on health, philosophy, and politics.',
  openGraph: {
    title: 'Handbooks',
    description:
      'Field manuals for the disciplined man. Long-form guides on health, philosophy, and politics.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Handbooks',
    description:
      'Field manuals for the disciplined man. Long-form guides on health, philosophy, and politics.',
  },
};

const VALID_LENSES = new Set<string>(['health', 'philosophy', 'politics']);

interface HandbooksPageProps {
  searchParams: Promise<{ lens?: string }>;
}

export default async function HandbooksPage({ searchParams }: HandbooksPageProps) {
  const { lens: rawLens } = await searchParams;

  const activeLens = VALID_LENSES.has(rawLens ?? '')
    ? (rawLens as Lens)
    : undefined;

  const handbooks = await getHandbooks({ lens: activeLens });

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl text-bmj-white">Handbooks</h1>
      <p className="mt-2 max-w-xl font-body text-lg text-bmj-cream/70">
        Field manuals for the disciplined man. Long-form guides on health,
        philosophy, and politics.
      </p>
      <StarDivider className="mb-6" />

      <div className="mb-8">
        <Suspense fallback={<div className="h-10 border-b border-bmj-tan/20" />}>
          <LensFilterTabs activeLens={activeLens ?? 'all'} />
        </Suspense>
      </div>

      {handbooks.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-label text-bmj-tan">No handbooks available yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {handbooks.map((handbook) => (
            <HandbookCard
              key={handbook.id}
              title={handbook.title}
              slug={handbook.slug}
              lens={handbook.lens}
              description={handbook.description}
              accessTier={handbook.access_tier}
              publishedAt={handbook.published_at}
              coverImage={handbook.cover_image}
            />
          ))}
        </div>
      )}
    </div>
  );
}
