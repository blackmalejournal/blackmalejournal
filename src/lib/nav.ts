export type NavLink = {
  label: string;
  href: string;
};

/**
 * Header navigation — the 5 primary destinations.
 * Auth CTAs (Log In / Join) are rendered separately by the Navbar component.
 */
export const HEADER_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academy', href: '/academy' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'Library', href: '/library' },
];

/**
 * Footer navigation — header links plus utility pages.
 */
export const FOOTER_NAV_LINKS: NavLink[] = [
  ...HEADER_NAV_LINKS,
  { label: 'Contact', href: '/contact' },
];
