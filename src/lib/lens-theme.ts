import type { Lens } from '@/lib/supabase/types';

export type LensTheme = {
  label: string;
  accentText: string;
  accentBorder: string;
  accentBg: string;
  accentSoftBg: string;
  badgeClasses: string;
  cardBorderTop: string;
  cardBorderLeft: string;
  hoverBorder: string;
};

export const LENS_THEMES: Record<Lens, LensTheme> = {
  health: {
    label: 'Health',
    accentText: 'text-bmj-amber',
    accentBorder: 'border-bmj-amber',
    accentBg: 'bg-bmj-amber',
    accentSoftBg: 'bg-bmj-amber/10',
    badgeClasses: 'border border-bmj-cream/20 bg-bmj-amber text-bmj-deep-black',
    cardBorderTop: 'border-t-bmj-amber',
    cardBorderLeft: 'border-l-bmj-amber',
    hoverBorder: 'hover:border-bmj-amber/60',
  },
  philosophy: {
    label: 'Philosophy',
    accentText: 'text-bmj-tan',
    accentBorder: 'border-bmj-tan',
    accentBg: 'bg-bmj-tan',
    accentSoftBg: 'bg-bmj-tan/10',
    badgeClasses: 'border border-bmj-tan/40 bg-bmj-tan text-bmj-deep-black',
    cardBorderTop: 'border-t-bmj-tan',
    cardBorderLeft: 'border-l-bmj-tan',
    hoverBorder: 'hover:border-bmj-tan/60',
  },
  politics: {
    label: 'Politics',
    accentText: 'text-bmj-red',
    accentBorder: 'border-bmj-red',
    accentBg: 'bg-bmj-red',
    accentSoftBg: 'bg-bmj-red/10',
    badgeClasses: 'border border-bmj-cream/20 bg-bmj-red text-bmj-white',
    cardBorderTop: 'border-t-bmj-red',
    cardBorderLeft: 'border-l-bmj-red',
    hoverBorder: 'hover:border-bmj-red/60',
  },
};

export function getLensTheme(lens: Lens): LensTheme {
  return LENS_THEMES[lens];
}
