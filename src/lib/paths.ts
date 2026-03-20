export function normalizeInternalPath(
  value: FormDataEntryValue | string | undefined | null,
  fallback = '/portal',
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

export function withOptionalNext(pathname: string, nextHref?: string): string {
  return withQuery(pathname, { next: nextHref });
}
