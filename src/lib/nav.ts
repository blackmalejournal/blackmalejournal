import { PATHS } from '@/lib/paths';

export type NavLink = {
  label: string;
  href: string;
};

/**
 * Header navigation — the 5 primary destinations.
 * Auth CTAs (Log In / Join) are rendered separately by the Navbar component.
 */
export const HEADER_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: PATHS.HOME },
  { label: 'About', href: PATHS.ABOUT },
  { label: 'Academy', href: PATHS.ACADEMY },
  { label: 'Downloads', href: PATHS.DOWNLOADS },
  { label: 'Records', href: PATHS.RECORDS },
];

/**
 * Footer navigation — header links plus utility pages.
 */
export const FOOTER_NAV_LINKS: NavLink[] = [
  ...HEADER_NAV_LINKS,
  { label: 'Contact', href: PATHS.CONTACT },
];
