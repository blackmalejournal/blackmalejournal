import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '@/lib/paths';

export type AttentionItem = {
  label: string;
  detail: string;
  href: string;
  tone: 'critical' | 'warning';
};

type AttentionQueueSectionProps = {
  items: AttentionItem[];
};

export function AttentionQueueSection({ items }: AttentionQueueSectionProps) {
  return (
    <section className="border border-bmj-tan/20 bg-bmj-brown p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl tracking-widest text-bmj-white">
            ATTENTION QUEUE
          </h2>
          <p className="mt-1 font-body text-sm text-bmj-cream/70">
            Resolve these items before adding new content.
          </p>
        </div>
        <Link
          href={PATHS.ADMIN_MESSAGES}
          className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
        >
          Open Inbox
          <ArrowRight size={14} />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 border border-[#416100]/30 bg-[#416100]/10 p-4 font-body text-sm text-bmj-cream/80">
          No urgent admin blockers are visible right now. The inbox is under
          control and there are no stale editorial or billing exceptions in
          the current snapshot.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.label}
              className={`border p-4 ${
                item.tone === 'critical'
                  ? 'border-bmj-red/30 bg-bmj-red/10'
                  : 'border-bmj-amber/30 bg-bmj-amber/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-label text-xs uppercase tracking-widest text-bmj-white">
                    {item.label}
                  </p>
                  <p className="mt-2 font-body text-sm text-bmj-cream/80">
                    {item.detail}
                  </p>
                </div>
                <Link
                  href={item.href}
                  className="shrink-0 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
                >
                  Resolve
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
