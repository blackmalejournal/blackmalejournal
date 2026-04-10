// src/lib/supabase/queries.ts
// NOTE: Several return sites cast `data` to the explicit row type (e.g. `as Article[]`).
// supabase-js v2.99's column-parser for select('*') with custom Database types infers
// the result as `{}[]` rather than the full row type. The cast is safe: the runtime
// data is always the full row because select('*') fetches all columns.
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { normalizeEmailAddress } from '@/lib/email';
import type {
  Article,
  ArticleListItem,
  Briefing,
  BriefingListItem,
  BriefingSitemapRow,
  Course,
  Dispatch,
  DispatchListItem,
  Download,
  Handbook,
  HandbookSitemapRow,
  Lesson,
  Member,
  MemberTier,
  Lens,
  AccessTier,
  SearchResult,
} from '@/lib/supabase/types';

const PUBLIC_CONTENT_STATUSES = ['published', 'scheduled'] as const;

function applyPublicContentVisibility<TQuery extends {
  in: (column: string, values: readonly string[]) => TQuery;
  lte: (column: string, value: string) => TQuery;
}>(query: TQuery, nowIso = new Date().toISOString()): TQuery {
  return query
    .in('status', PUBLIC_CONTENT_STATUSES)
    .lte('published_at', nowIso);
}

// ── Articles ──────────────────────────────────────────────────────────────────

export async function getArticles(
  options: {
    lens?: Lens;
    tag?: string;
    limit?: number;
    offset?: number;
    tier?: AccessTier;
  } = {},
): Promise<Article[]> {
  const { lens, tag, limit = 20, offset = 0, tier } = options;
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = applyPublicContentVisibility(supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1), nowIso);

  if (lens) query = query.eq('lens', lens);
  if (tag) query = query.contains('tags', [tag]);
  if (tier) query = query.eq('access_tier', tier);

  const { data, error } = await query;
  if (error) {
    console.error('[getArticles]', error.message);
    return [];
  }
  return (data ?? []) as Article[];
}

const ARTICLE_LIST_SELECT =
  'id,title,slug,lens,tags,excerpt,featured,access_tier,cover_image,published_at,author';

export async function getArticlesForListing(
  options: {
    lens?: Lens;
    tag?: string;
    limit?: number;
    offset?: number;
    tier?: AccessTier;
  } = {},
): Promise<ArticleListItem[]> {
  const { lens, tag, limit = 20, offset = 0, tier } = options;
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = applyPublicContentVisibility(supabase
    .from('articles')
    .select(ARTICLE_LIST_SELECT)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1), nowIso);

  if (lens) query = query.eq('lens', lens);
  if (tag) query = query.contains('tags', [tag]);
  if (tier) query = query.eq('access_tier', tier);

  const { data, error } = await query;
  if (error) {
    console.error('[getArticlesForListing]', error.message);
    return [];
  }
  return (data ?? []) as ArticleListItem[];
}

export async function getArticleTagFacets(
  options: { lens?: Lens; limit?: number } = {},
): Promise<Array<{ tags: string[] }>> {
  const { lens, limit = 200 } = options;
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = applyPublicContentVisibility(supabase
    .from('articles')
    .select('tags')
    .order('published_at', { ascending: false })
    .range(0, limit - 1), nowIso);

  if (lens) query = query.eq('lens', lens);

  const { data, error } = await query;
  if (error) {
    console.error('[getArticleTagFacets]', error.message);
    return [];
  }
  return (data ?? []) as Array<{ tags: string[] }>;
}

/** Per-request dedupe: `generateMetadata` and the page both call this for the same slug. */
export const getArticleBySlug = cache(async function getArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('articles')
    .select('*')
    .eq('slug', slug))
    .single();

  if (error) return null;
  return data as Article;
});

export async function getFeaturedArticles(
  limit = 3,
): Promise<ArticleListItem[]> {
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('articles')
    .select(ARTICLE_LIST_SELECT)
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(limit));

  if (error) {
    console.error('[getFeaturedArticles]', error.message);
    return [];
  }
  return (data ?? []) as ArticleListItem[];
}

export async function getLatestArticles(
  limit = 10,
): Promise<ArticleListItem[]> {
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('articles')
    .select(ARTICLE_LIST_SELECT)
    .order('published_at', { ascending: false })
    .limit(limit));

  if (error) {
    console.error('[getLatestArticles]', error.message);
    return [];
  }
  return (data ?? []) as ArticleListItem[];
}

// ── Briefings ─────────────────────────────────────────────────────────────────

const BRIEFING_LIST_SELECT =
  'id,issue_number,slug,title,lead_kicker,access_tier,status,cover_image,published_at,created_at';

export async function getBriefings(
  options: { limit?: number; offset?: number } = {},
): Promise<BriefingListItem[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('briefings')
    .select(BRIEFING_LIST_SELECT)
    .order('issue_number', { ascending: false })
    .range(offset, offset + limit - 1));

  if (error) {
    console.error('[getBriefings]', error.message);
    return [];
  }
  return (data ?? []) as BriefingListItem[];
}

export async function getBriefingsForSitemap(
  options: { limit?: number; offset?: number } = {},
): Promise<BriefingSitemapRow[]> {
  const { limit = 200, offset = 0 } = options;
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('briefings')
    .select('slug,published_at')
    .order('issue_number', { ascending: false })
    .range(offset, offset + limit - 1));

  if (error) {
    console.error('[getBriefingsForSitemap]', error.message);
    return [];
  }
  return (data ?? []) as BriefingSitemapRow[];
}

export const getBriefingBySlug = cache(async function getBriefingBySlug(
  slug: string,
): Promise<Briefing | null> {
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('briefings')
    .select('*')
    .eq('slug', slug))
    .single();

  if (error) return null;
  return data as Briefing;
});

export async function getLatestBriefing(): Promise<BriefingListItem | null> {
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('briefings')
    .select(BRIEFING_LIST_SELECT)
    .order('issue_number', { ascending: false })
    .limit(1))
    .single();

  if (error) return null;
  return data as BriefingListItem;
}

export async function getBriefingByIssue(
  issueNumber: number,
): Promise<Briefing | null> {
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('briefings')
    .select('*')
    .eq('issue_number', issueNumber))
    .single();

  if (error) return null;
  return data as Briefing;
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function getMemberById(userId: string): Promise<Member | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as Member;
}

export async function getMemberByEmail(email: string): Promise<Member | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data as Member;
}

export async function updateMemberTier(
  userId: string,
  tier: MemberTier,
  stripeData?: { customerId: string; subscriptionId: string },
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('members')
    .update(
      stripeData
        ? {
            tier,
            stripe_customer_id: stripeData.customerId,
            stripe_subscription_id: stripeData.subscriptionId,
          }
        : { tier },
    )
    .eq('id', userId);

  if (error) {
    console.error('[updateMemberTier]', error.message);
  }
}

// ── Courses ───────────────────────────────────────────────────────────────────

/** Matches `public.courses` columns used by `Course` — no extra DB fields over the wire. */
const COURSE_LIST_SELECT =
  'id,title,slug,description,category,access_tier,published,cover_image,created_at';

export async function getCourses(
  options: { category?: string; published?: boolean } = {},
): Promise<Course[]> {
  const { category, published } = options;
  const supabase = await createClient();

  let query = supabase
    .from('courses')
    .select(COURSE_LIST_SELECT)
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (published !== undefined) query = query.eq('published', published);

  const { data, error } = await query;
  if (error) {
    console.error('[getCourses]', error.message);
    return [];
  }
  return (data ?? []) as Course[];
}

export const getCourseBySlug = cache(async function getCourseBySlug(
  slug: string,
): Promise<Course | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Course;
});

// ── Lessons ──────────────────────────────────────────────────────────────

export async function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .eq('published', true)
    .order('order_number', { ascending: true });

  if (error) {
    console.error('[getLessonsByCourse]', error.message);
    return [];
  }
  return (data ?? []) as Lesson[];
}

export const getLessonBySlug = cache(async function getLessonBySlug(
  courseId: string,
  lessonSlug: string,
): Promise<Lesson | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .eq('slug', lessonSlug)
    .eq('published', true)
    .single();

  if (error) return null;
  return data as Lesson;
});

// ── Newsletter ────────────────────────────────────────────────────────────────

export async function subscribeToNewsletter(
  email: string,
  source?: string,
): Promise<void> {
  const supabase = await createClient();
  const normalizedEmail = normalizeEmailAddress(email);
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      {
        email: normalizedEmail,
        source: source?.trim() || null,
        unsubscribed_at: null,
      },
      { onConflict: 'email' },
    );

  if (error) {
    console.error('[subscribeToNewsletter]', error.message);
    throw error;
  }
}

export async function unsubscribeFromNewsletter(email: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', normalizeEmailAddress(email));

  if (error) {
    console.error('[unsubscribeFromNewsletter]', error.message);
  }
}

// ── Contact ───────────────────────────────────────────────────────────────────

export async function submitContactForm(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('contact_submissions').insert({
    name: data.name,
    email: data.email,
    subject: data.subject ?? null,
    message: data.message,
  });

  if (error) {
    console.error('[submitContactForm]', error.message);
    throw error;
  }
}

// ── Dispatches ──────────────────────────────────────────────────────────────

const DISPATCH_LIST_SELECT = 'id,title,slug,lens,excerpt,published_at';

export async function getDispatchesForListing(
  options: { limit?: number; offset?: number } = {},
): Promise<DispatchListItem[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('dispatches')
    .select(DISPATCH_LIST_SELECT)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1));

  if (error) {
    console.error('[getDispatchesForListing]', error.message);
    return [];
  }
  return (data ?? []) as DispatchListItem[];
}

export async function getDispatches(
  options: { limit?: number; offset?: number } = {},
): Promise<Dispatch[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('dispatches')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1));

  if (error) {
    console.error('[getDispatches]', error.message);
    return [];
  }
  return (data ?? []) as Dispatch[];
}

export const getDispatchBySlug = cache(async function getDispatchBySlug(
  slug: string,
): Promise<Dispatch | null> {
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('dispatches')
    .select('*')
    .eq('slug', slug))
    .single();

  if (error) return null;
  return data as Dispatch;
});

export async function getLatestDispatches(
  limit = 3,
): Promise<DispatchListItem[]> {
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('dispatches')
    .select(DISPATCH_LIST_SELECT)
    .order('published_at', { ascending: false })
    .limit(limit));

  if (error) {
    console.error('[getLatestDispatches]', error.message);
    return [];
  }
  return (data ?? []) as DispatchListItem[];
}

// ── Handbooks ─────────────────────────────────────────────────────────────

export async function getHandbooks(
  options: {
    lens?: Lens;
    limit?: number;
    offset?: number;
  } = {},
): Promise<Handbook[]> {
  const { lens, limit = 20, offset = 0 } = options;
  const supabase = await createClient();

  let query = applyPublicContentVisibility(supabase
    .from('handbooks')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1));

  if (lens) query = query.eq('lens', lens);

  const { data, error } = await query;
  if (error) {
    console.error('[getHandbooks]', error.message);
    return [];
  }
  return (data ?? []) as Handbook[];
}

export async function getHandbooksForSitemap(
  options: { limit?: number; offset?: number } = {},
): Promise<HandbookSitemapRow[]> {
  const { limit = 200, offset = 0 } = options;
  const supabase = await createClient();

  const { data, error } = await applyPublicContentVisibility(supabase
    .from('handbooks')
    .select('slug,published_at')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1));

  if (error) {
    console.error('[getHandbooksForSitemap]', error.message);
    return [];
  }
  return (data ?? []) as HandbookSitemapRow[];
}

export const getHandbookBySlug = cache(async function getHandbookBySlug(
  slug: string,
): Promise<Handbook | null> {
  const supabase = await createClient();
  const { data, error } = await applyPublicContentVisibility(supabase
    .from('handbooks')
    .select('*')
    .eq('slug', slug))
    .single();

  if (error) return null;
  return data as Handbook;
});

// ── Downloads ─────────────────────────────────────────────────────────────

export async function getDownloads(
  options: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<Download[]> {
  const { category, limit = 40, offset = 0 } = options;
  const supabase = await createClient();

  let query = supabase
    .from('downloads')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    console.error('[getDownloads]', error.message);
    return [];
  }
  return (data ?? []) as Download[];
}

export const getDownloadBySlug = cache(async function getDownloadBySlug(
  slug: string,
): Promise<Download | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Download;
});

// ── Search ──────────────────────────────────────────────────────────────────

export async function searchContent(
  query: string,
  options: { limit?: number } = {},
): Promise<SearchResult[]> {
  const { limit = 20 } = options;
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  // Escape LIKE wildcards to prevent % or _ from matching all rows
  const escaped = query.trim().replace(/[%_\\]/g, '\\$&');
  const term = `%${escaped}%`;

  const [articles, briefings, handbooks, dispatches] = await Promise.all([
    applyPublicContentVisibility(supabase
      .from('articles')
      .select('title, slug, excerpt, lens, published_at')
      .or(`title.ilike.${term},excerpt.ilike.${term}`)
      .order('published_at', { ascending: false })
      .limit(limit)),
    applyPublicContentVisibility(supabase
      .from('briefings')
      .select('title, slug, published_at')
      .ilike('title', term)
      .order('published_at', { ascending: false })
      .limit(limit)),
    applyPublicContentVisibility(supabase
      .from('handbooks')
      .select('title, slug, description, lens, published_at')
      .or(`title.ilike.${term},description.ilike.${term}`)
      .order('published_at', { ascending: false })
      .limit(limit)),
    applyPublicContentVisibility(supabase
      .from('dispatches')
      .select('title, slug, excerpt, lens, published_at')
      .or(`title.ilike.${term},excerpt.ilike.${term}`)
      .order('published_at', { ascending: false })
      .limit(limit)),
  ]);

  const results: SearchResult[] = [];

  for (const row of (articles.data ?? []) as { title: string; slug: string; excerpt: string; lens: Lens; published_at: string }[]) {
    results.push({ type: 'article', title: row.title, slug: row.slug, excerpt: row.excerpt, lens: row.lens, publishedAt: row.published_at });
  }
  for (const row of (briefings.data ?? []) as { title: string; slug: string; published_at: string }[]) {
    results.push({ type: 'briefing', title: row.title, slug: row.slug, excerpt: '', publishedAt: row.published_at });
  }
  for (const row of (handbooks.data ?? []) as { title: string; slug: string; description: string; lens: Lens; published_at: string }[]) {
    results.push({ type: 'handbook', title: row.title, slug: row.slug, excerpt: row.description, lens: row.lens, publishedAt: row.published_at });
  }
  for (const row of (dispatches.data ?? []) as { title: string; slug: string; excerpt: string; lens: Lens; published_at: string }[]) {
    results.push({ type: 'dispatch', title: row.title, slug: row.slug, excerpt: row.excerpt, lens: row.lens, publishedAt: row.published_at });
  }

  results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return results.slice(0, limit);
}

// ── Search (FTS via Supabase RPC) ────────────────────────────────────────────

export type SearchFTSOptions = {
  lens?: string[];
  types?: string[];
  sort?: 'relevance' | 'date';
  limit?: number;
};

export async function searchContentFTS(
  query: string,
  options: SearchFTSOptions = {},
): Promise<SearchResult[]> {
  const { lens, types, sort = 'relevance', limit = 30 } = options;
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const { data, error } = await (supabase as unknown as { rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }> }).rpc('search_content', {
    query: query.trim(),
    filter_lens: lens ?? null,
    filter_types: types ?? null,
    sort_by: sort,
    result_limit: limit,
  });

  if (error) {
    console.error('[searchContentFTS]', error.message);
    return [];
  }

  return ((data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    lens: string | null;
    access_tier: string;
    published_at: string;
    content_type: string;
    relevance: number;
  }>).map((row) => ({
    type: row.content_type as SearchResult['type'],
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? '',
    lens: (row.lens as Lens) ?? undefined,
    accessTier: (row.access_tier as AccessTier) ?? undefined,
    publishedAt: row.published_at,
    relevance: row.relevance,
  }));
}
