import type { Lens } from '@/lib/supabase/types';

const LENS_STYLES: Record<Lens, string> = {
  health:     'bg-bmj-red    text-bmj-white',
  philosophy: 'bg-bmj-amber  text-bmj-black',
  politics:   'bg-bmj-brown  text-bmj-white border border-bmj-tan/40',
};

const LENS_LABELS: Record<Lens, string> = {
  health:     'Health',
  philosophy: 'Philosophy',
  politics:   'Politics',
};

interface LensBadgeProps {
  lens: Lens;
  className?: string;
}

export function LensBadge({ lens, className = '' }: LensBadgeProps) {
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 font-label text-xs uppercase tracking-widest ${LENS_STYLES[lens]} ${className}`}
    >
      {LENS_LABELS[lens]}
    </span>
  );
}
