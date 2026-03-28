export const PATHS = {
  HOME: '/',
  ABOUT: '/about',
  ABOUT_ETHICS: '/about/ethics',
  ACADEMY: '/academy',
  VIDEO: '/video',
  BLOG: '/blog',
  ARTICLES: '/articles',
  BRIEFINGS: '/briefings',
  HANDBOOKS: '/handbooks',
  DOWNLOADS: '/downloads',
  RECORDS: '/records',
  PRICING: '/pricing',
  CONTACT: '/contact',
  SUPPORT: '/support',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  SEARCH: '/search',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PORTAL: '/portal',
  PORTAL_SETTINGS: '/portal/settings',
  ADMIN: '/admin',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_BRIEFINGS: '/admin/briefings',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_DISPATCHES: '/admin/dispatches',
  ADMIN_DOWNLOADS: '/admin/downloads',
  ADMIN_HANDBOOKS: '/admin/handbooks',
  ADMIN_MEMBERS: '/admin/members',
  ADMIN_MESSAGES: '/admin/messages',
  ADMIN_SUBSCRIBERS: '/admin/subscribers',
  ADMIN_ARTICLES_NEW: '/admin/articles/new',
  ADMIN_BRIEFINGS_NEW: '/admin/briefings/new',
  ADMIN_COURSES_NEW: '/admin/courses/new',
  ADMIN_DISPATCHES_NEW: '/admin/dispatches/new',
  ADMIN_DOWNLOADS_NEW: '/admin/downloads/new',
  ADMIN_HANDBOOKS_NEW: '/admin/handbooks/new',
  ADMIN_CAMPAIGNS: '/admin/campaigns',
  ADMIN_CAMPAIGNS_NEW: '/admin/campaigns/new',
  AUTH_CALLBACK: '/auth/callback',
} as const;

export function adminEditPath(section: string, id: string): string {
  return `${PATHS.ADMIN}/${section}/${id}/edit`;
}

export function normalizeInternalPath(
  value: FormDataEntryValue | string | undefined | null,
  fallback: string = PATHS.PORTAL,
): string {
  if (typeof value !== 'string') return fallback;

  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, 'http://bmj.local');
    if (parsed.origin !== 'http://bmj.local') return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function withQuery(
  pathname: string,
  params: Record<string, string | undefined>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value);
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function appendQuery(
  pathname: string,
  params: Record<string, string | undefined>,
): string {
  const normalized = normalizeInternalPath(pathname, pathname);

  try {
    const parsed = new URL(normalized, 'http://bmj.local');

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        parsed.searchParams.set(key, value);
      } else {
        parsed.searchParams.delete(key);
      }
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return withQuery(normalized, params);
  }
}

export function withOptionalNext(pathname: string, nextHref?: string): string {
  return withQuery(pathname, { next: nextHref });
}
