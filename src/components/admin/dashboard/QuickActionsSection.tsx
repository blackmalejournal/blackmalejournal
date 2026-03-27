import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PATHS } from '@/lib/paths';

export function QuickActionsSection() {
  return (
    <section aria-labelledby="actions-heading">
      <h2
        id="actions-heading"
        className="font-label text-xs uppercase tracking-widest text-bmj-tan"
      >
        Quick Actions
      </h2>
      <div className="mt-4 flex flex-wrap gap-4">
        <Link
          href={PATHS.ADMIN_ARTICLES_NEW}
          className="inline-flex items-center gap-2 bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Article
        </Link>
        <Link
          href={PATHS.ADMIN_BRIEFINGS_NEW}
          className="inline-flex items-center gap-2 border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-tan/70"
        >
          <Plus size={16} />
          New Briefing
        </Link>
        <Link
          href={PATHS.ADMIN_DISPATCHES_NEW}
          className="inline-flex items-center gap-2 border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-tan/70"
        >
          <Plus size={16} />
          New Dispatch
        </Link>
        <Link
          href={PATHS.ADMIN_COURSES_NEW}
          className="inline-flex items-center gap-2 border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-tan/70"
        >
          <Plus size={16} />
          New Course
        </Link>
        <Link
          href={PATHS.ADMIN_HANDBOOKS_NEW}
          className="inline-flex items-center gap-2 border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-tan/70"
        >
          <Plus size={16} />
          New Handbook
        </Link>
        <Link
          href={PATHS.ADMIN_DOWNLOADS_NEW}
          className="inline-flex items-center gap-2 border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-tan/70"
        >
          <Plus size={16} />
          New Download
        </Link>
      </div>
    </section>
  );
}
