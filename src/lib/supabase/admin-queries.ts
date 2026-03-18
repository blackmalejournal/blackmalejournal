// src/lib/supabase/admin-queries.ts
// CRUD functions for the admin CMS. Uses the service-role client (bypasses RLS).
// These must ONLY run in trusted server contexts — never expose to the browser.

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Article,
  ContentStatus,
  Lens,
  AccessTier,
} from '@/lib/supabase/types';

// ── Articles ──────────────────────────────────────────────────────────────────

/**
 * List all articles (including drafts). For the admin article list.
 */
export async function getAllArticles(options?: {
  status?: ContentStatus;
  lens?: Lens;
  limit?: number;
  offset?: number;
}): Promise<Article[]> {
  const { status, lens, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();

  let query = supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (lens) query = query.eq('lens', lens);

  const { data, error } = await query;
  if (error) {
    console.error('[getAllArticles]', error.message);
    return [];
  }
  return (data ?? []) as Article[];
}

/**
 * Get a single article by UUID. For the admin edit page.
 */
export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getArticleById]', error.message);
    return null;
  }
  return data as Article;
}

/**
 * Insert a new article.
 * Auto-sets published_at to now when status is 'published' and no date provided.
 */
export async function createArticle(data: {
  title: string;
  slug: string;
  lens: Lens;
  tags: string[];
  excerpt: string;
  body: string;
  access_tier: AccessTier;
  status: ContentStatus;
  featured: boolean;
  author: string;
  cover_image?: string | null;
  published_at?: string | null;
}): Promise<Article | null> {
  const supabase = createAdminClient();

  const published_at =
    data.status === 'published' && !data.published_at
      ? new Date().toISOString()
      : (data.published_at ?? null);

  const { data: created, error } = await supabase
    .from('articles')
    .insert({
      title: data.title,
      slug: data.slug,
      lens: data.lens,
      tags: data.tags,
      excerpt: data.excerpt,
      body: data.body,
      access_tier: data.access_tier,
      status: data.status,
      featured: data.featured,
      author: data.author,
      cover_image: data.cover_image ?? null,
      published_at: published_at as string,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createArticle]', error.message);
    return null;
  }
  return created as Article;
}

/**
 * Update an existing article by UUID.
 * Auto-sets published_at to now when status changes to 'published' and no date provided.
 */
export async function updateArticle(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    lens: Lens;
    tags: string[];
    excerpt: string;
    body: string;
    access_tier: AccessTier;
    status: ContentStatus;
    featured: boolean;
    author: string;
    cover_image: string | null;
    published_at: string | null;
  }>,
): Promise<Article | null> {
  const supabase = createAdminClient();

  const payload = { ...data };

  // Auto-set published_at when transitioning to published
  if (payload.status === 'published' && !('published_at' in payload)) {
    payload.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from('articles')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateArticle]', error.message);
    return null;
  }
  return updated as Article;
}

/**
 * Hard-delete an article by UUID.
 */
export async function deleteArticle(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteArticle]', error.message);
    return false;
  }
  return true;
}

// ── Dashboard counts ──────────────────────────────────────────────────────────

/**
 * Aggregate content counts for the admin dashboard overview.
 * Uses head-only queries for efficient counting.
 */
export async function getContentCounts(): Promise<{
  articles: { total: number; published: number; draft: number };
  briefings: { total: number; published: number; draft: number };
  dispatches: { total: number; published: number; draft: number };
  downloads: { total: number };
}> {
  const supabase = createAdminClient();

  const [
    articlesTotal,
    articlesPublished,
    articlesDraft,
    briefingsTotal,
    briefingsPublished,
    briefingsDraft,
    dispatchesTotal,
    dispatchesPublished,
    dispatchesDraft,
    downloadsTotal,
  ] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('briefings').select('id', { count: 'exact', head: true }),
    supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('dispatches').select('id', { count: 'exact', head: true }),
    supabase.from('dispatches').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('dispatches').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('downloads').select('id', { count: 'exact', head: true }),
  ]);

  return {
    articles: {
      total: articlesTotal.count ?? 0,
      published: articlesPublished.count ?? 0,
      draft: articlesDraft.count ?? 0,
    },
    briefings: {
      total: briefingsTotal.count ?? 0,
      published: briefingsPublished.count ?? 0,
      draft: briefingsDraft.count ?? 0,
    },
    dispatches: {
      total: dispatchesTotal.count ?? 0,
      published: dispatchesPublished.count ?? 0,
      draft: dispatchesDraft.count ?? 0,
    },
    downloads: {
      total: downloadsTotal.count ?? 0,
    },
  };
}
