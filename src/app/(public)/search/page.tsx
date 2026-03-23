import type { Metadata } from 'next';
import Link from 'next/link';
import { searchContent } from '@/lib/supabase/queries';
import { LensBadge } from '@/components/brand/LensBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { SEARCH_TYPE_ICONS, SEARCH_TYPE_PATHS } from '@/lib/content/search-constants';
import type { Lens, SearchResult } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Search — The Black Male Journal',
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = query.length >= 2 ? await searchContent(query) : [];

  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <h1 className="font-display text-5xl text-bmj-white">Search</h1>
      <StarDivider />

      <form action="/search" method="GET" className="mb-12">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search articles, briefings, handbooks..."
            className="flex-1 border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder-bmj-tan/50 outline-none focus:border-bmj-red"
            aria-label="Search"
          />
          <button
            type="submit"
            className="bg-bmj-red px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <p className="mb-8 font-mono text-xs text-bmj-tan">
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      <div className="space-y-1">
        {results.map((result: SearchResult) => {
          const Icon = SEARCH_TYPE_ICONS[result.type] ?? SEARCH_TYPE_ICONS.article;
          const href = `${SEARCH_TYPE_PATHS[result.type] ?? '/articles'}/${result.slug}`;
          return (
            <Link
              key={`${result.type}-${result.slug}`}
              href={href}
              className="flex items-start gap-4 border-b border-bmj-tan/10 py-6 no-underline transition-colors hover:bg-bmj-brown/50"
            >
              <Icon size={18} className="mt-1 shrink-0 text-bmj-tan" aria-hidden="true" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-micro uppercase tracking-widest text-bmj-tan">{result.type}</span>
                  {result.lens && <LensBadge lens={result.lens as Lens} />}
                </div>
                <h2 className="mt-1 font-display text-xl text-bmj-white">{result.title}</h2>
                {result.excerpt && (
                  <p className="mt-1 line-clamp-2 font-body text-sm text-bmj-cream/70">{result.excerpt}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {query && results.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-body text-lg text-bmj-cream">No results found.</p>
          <p className="mt-2 font-body text-sm text-bmj-tan">
            Try different keywords or browse our{' '}
            <Link href="/articles" className="text-bmj-red">articles</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
