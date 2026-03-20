// src/lib/supabase/admin-queries.ts
// CRUD functions for the admin CMS. Uses the service-role client (bypasses RLS).
// These must ONLY run in trusted server contexts — never expose to the browser.

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Article,
  Briefing,
  BriefingSection,
  ContactSubmission,
  ContactSubmissionStatus,
  ContentStatus,
  Course,
  Dispatch,
  Download,
  Handbook,
  Lens,
  Lesson,
  AccessTier,
  Member,
  MemberTier,
  MemberRole,
  NewsletterSubscriber,
} from '@/lib/supabase/types';

function buildSearchPattern(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return `%${trimmed.replace(/[%_\\]/g, '\\$&')}%`;
}

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
    published_at: string;
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

// ── Briefings ──────────────────────────────────────────────────────────────────

/**
 * List all briefings (including drafts). For the admin briefing list.
 */
export async function getAllBriefings(options?: {
  status?: ContentStatus;
  limit?: number;
  offset?: number;
}): Promise<Briefing[]> {
  const { status, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();

  let query = supabase
    .from('briefings')
    .select('*')
    .order('issue_number', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    console.error('[getAllBriefings]', error.message);
    return [];
  }
  return (data ?? []) as Briefing[];
}

/**
 * Get a single briefing by UUID. For the admin edit page.
 */
export async function getBriefingById(id: string): Promise<Briefing | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getBriefingById]', error.message);
    return null;
  }
  return data as Briefing;
}

/**
 * Insert a new briefing.
 * Auto-sets published_at to now when status is 'published' and no date provided.
 */
export async function createBriefing(data: {
  issue_number: number;
  title: string;
  slug: string;
  sections: BriefingSection[];
  access_tier: AccessTier;
  status: ContentStatus;
  cover_image?: string | null;
  published_at?: string | null;
}): Promise<Briefing | null> {
  const supabase = createAdminClient();

  const published_at =
    data.status === 'published' && !data.published_at
      ? new Date().toISOString()
      : (data.published_at ?? null);

  const { data: created, error } = await supabase
    .from('briefings')
    .insert({
      issue_number: data.issue_number,
      title: data.title,
      slug: data.slug,
      sections: data.sections,
      access_tier: data.access_tier,
      status: data.status,
      cover_image: data.cover_image ?? null,
      published_at: published_at as string,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createBriefing]', error.message);
    return null;
  }
  return created as Briefing;
}

/**
 * Update an existing briefing by UUID.
 * Auto-sets published_at to now when status changes to 'published' and no date provided.
 */
export async function updateBriefing(
  id: string,
  data: Partial<{
    issue_number: number;
    title: string;
    slug: string;
    sections: BriefingSection[];
    access_tier: AccessTier;
    status: ContentStatus;
    cover_image: string | null;
    published_at: string;
  }>,
): Promise<Briefing | null> {
  const supabase = createAdminClient();

  const payload = { ...data };

  // Auto-set published_at when transitioning to published
  if (payload.status === 'published' && !('published_at' in payload)) {
    payload.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from('briefings')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateBriefing]', error.message);
    return null;
  }
  return updated as Briefing;
}

/**
 * Hard-delete a briefing by UUID.
 */
export async function deleteBriefing(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('briefings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteBriefing]', error.message);
    return false;
  }
  return true;
}

// ── Dispatches ─────────────────────────────────────────────────────────────────

/**
 * List all dispatches (including drafts). For the admin dispatch list.
 */
export async function getAllDispatches(options?: {
  status?: ContentStatus;
  lens?: Lens;
  limit?: number;
  offset?: number;
}): Promise<Dispatch[]> {
  const { status, lens, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();

  let query = supabase
    .from('dispatches')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (lens) query = query.eq('lens', lens);

  const { data, error } = await query;
  if (error) {
    console.error('[getAllDispatches]', error.message);
    return [];
  }
  return (data ?? []) as Dispatch[];
}

/**
 * Get a single dispatch by UUID. For the admin edit page.
 */
export async function getDispatchById(id: string): Promise<Dispatch | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('dispatches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getDispatchById]', error.message);
    return null;
  }
  return data as Dispatch;
}

/**
 * Insert a new dispatch.
 * Auto-sets published_at to now when status is 'published' and no date provided.
 */
export async function createDispatch(data: {
  title: string;
  slug: string;
  lens: Lens;
  excerpt: string;
  body: string;
  status: ContentStatus;
  author: string;
  cover_image?: string | null;
  published_at?: string | null;
}): Promise<Dispatch | null> {
  const supabase = createAdminClient();

  const published_at =
    data.status === 'published' && !data.published_at
      ? new Date().toISOString()
      : (data.published_at ?? null);

  const { data: created, error } = await supabase
    .from('dispatches')
    .insert({
      title: data.title,
      slug: data.slug,
      lens: data.lens,
      excerpt: data.excerpt,
      body: data.body,
      status: data.status,
      author: data.author,
      cover_image: data.cover_image ?? null,
      published_at: published_at as string,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createDispatch]', error.message);
    return null;
  }
  return created as Dispatch;
}

/**
 * Update an existing dispatch by UUID.
 * Auto-sets published_at to now when status changes to 'published' and no date provided.
 */
export async function updateDispatch(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    lens: Lens;
    excerpt: string;
    body: string;
    status: ContentStatus;
    author: string;
    cover_image: string | null;
    published_at: string;
  }>,
): Promise<Dispatch | null> {
  const supabase = createAdminClient();

  const payload = { ...data };

  // Auto-set published_at when transitioning to published
  if (payload.status === 'published' && !('published_at' in payload)) {
    payload.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from('dispatches')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateDispatch]', error.message);
    return null;
  }
  return updated as Dispatch;
}

/**
 * Hard-delete a dispatch by UUID.
 */
export async function deleteDispatch(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('dispatches')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteDispatch]', error.message);
    return false;
  }
  return true;
}

// ── Downloads ──────────────────────────────────────────────────────────────────

/**
 * List all downloads. For the admin download list.
 */
export async function getAllDownloads(options?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<Download[]> {
  const { category, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();

  let query = supabase
    .from('downloads')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    console.error('[getAllDownloads]', error.message);
    return [];
  }
  return (data ?? []) as Download[];
}

/**
 * Get a single download by UUID. For the admin edit page.
 */
export async function getDownloadById(id: string): Promise<Download | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getDownloadById]', error.message);
    return null;
  }
  return data as Download;
}

/**
 * Insert a new download.
 * Auto-sets published_at to now if not provided.
 */
export async function createDownload(data: {
  title: string;
  slug: string;
  description: string;
  category: string;
  file_url: string;
  file_type: string;
  file_size: number;
  access_tier: AccessTier;
  cover_image?: string | null;
  published_at?: string | null;
}): Promise<Download | null> {
  const supabase = createAdminClient();

  const published_at = data.published_at ?? new Date().toISOString();

  const { data: created, error } = await supabase
    .from('downloads')
    .insert({
      title: data.title,
      slug: data.slug,
      description: data.description,
      category: data.category,
      file_url: data.file_url,
      file_type: data.file_type,
      file_size: data.file_size,
      access_tier: data.access_tier,
      cover_image: data.cover_image ?? null,
      published_at,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createDownload]', error.message);
    return null;
  }
  return created as Download;
}

/**
 * Update an existing download by UUID.
 */
export async function updateDownload(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    description: string;
    category: string;
    file_url: string;
    file_type: string;
    file_size: number;
    access_tier: AccessTier;
    cover_image: string | null;
    published_at: string;
  }>,
): Promise<Download | null> {
  const supabase = createAdminClient();

  const { data: updated, error } = await supabase
    .from('downloads')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateDownload]', error.message);
    return null;
  }
  return updated as Download;
}

/**
 * Hard-delete a download by UUID.
 */
export async function deleteDownload(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('downloads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteDownload]', error.message);
    return false;
  }
  return true;
}

// ── Handbooks ──────────────────────────────────────────────────────────────────

/**
 * List all handbooks (including drafts). For the admin handbook list.
 */
export async function getAllHandbooks(options?: {
  status?: ContentStatus;
  lens?: Lens;
  limit?: number;
  offset?: number;
}): Promise<Handbook[]> {
  const { status, lens, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();

  let query = supabase
    .from('handbooks')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (lens) query = query.eq('lens', lens);

  const { data, error } = await query;
  if (error) {
    console.error('[getAllHandbooks]', error.message);
    return [];
  }
  return (data ?? []) as Handbook[];
}

/**
 * Get a single handbook by UUID. For the admin edit page.
 */
export async function getHandbookById(id: string): Promise<Handbook | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('handbooks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getHandbookById]', error.message);
    return null;
  }
  return data as Handbook;
}

/**
 * Insert a new handbook.
 * Auto-sets published_at to now when status is 'published' and no date provided.
 */
export async function createHandbook(data: {
  title: string;
  slug: string;
  lens: Lens;
  description: string;
  body: string;
  access_tier: AccessTier;
  status: ContentStatus;
  author: string;
  cover_image?: string | null;
  file_url?: string | null;
  published_at?: string | null;
}): Promise<Handbook | null> {
  const supabase = createAdminClient();

  const published_at =
    data.status === 'published' && !data.published_at
      ? new Date().toISOString()
      : (data.published_at ?? null);

  const { data: created, error } = await supabase
    .from('handbooks')
    .insert({
      title: data.title,
      slug: data.slug,
      lens: data.lens,
      description: data.description,
      body: data.body,
      access_tier: data.access_tier,
      status: data.status,
      author: data.author,
      cover_image: data.cover_image ?? null,
      file_url: data.file_url ?? null,
      published_at: published_at as string,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createHandbook]', error.message);
    return null;
  }
  return created as Handbook;
}

/**
 * Update an existing handbook by UUID.
 * Auto-sets published_at to now when status changes to 'published' and no date provided.
 */
export async function updateHandbook(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    lens: Lens;
    description: string;
    body: string;
    access_tier: AccessTier;
    status: ContentStatus;
    author: string;
    cover_image: string | null;
    file_url: string | null;
    published_at: string;
  }>,
): Promise<Handbook | null> {
  const supabase = createAdminClient();

  const payload = { ...data };

  // Auto-set published_at when transitioning to published
  if (payload.status === 'published' && !('published_at' in payload)) {
    payload.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from('handbooks')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateHandbook]', error.message);
    return null;
  }
  return updated as Handbook;
}

/**
 * Hard-delete a handbook by UUID.
 */
export async function deleteHandbook(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('handbooks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteHandbook]', error.message);
    return false;
  }
  return true;
}

// ── Courses ────────────────────────────────────────────────────────────────────

export async function getAllCourses(options?: {
  published?: boolean;
  category?: string;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<Course[]> {
  const { published, category, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (published !== undefined) search = search.eq('published', published);
  if (category) search = search.eq('category', category);
  if (searchPattern) {
    search = search.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`);
  }

  const { data, error } = await search;
  if (error) {
    console.error('[getAllCourses]', error.message);
    return [];
  }
  return (data ?? []) as Course[];
}

export async function getCourseById(id: string): Promise<Course | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getCourseById]', error.message);
    return null;
  }
  return data as Course;
}

export async function createCourse(data: {
  title: string;
  slug: string;
  description: string;
  category: string;
  access_tier: AccessTier;
  published: boolean;
  cover_image?: string | null;
}): Promise<Course | null> {
  const supabase = createAdminClient();
  const { data: created, error } = await supabase
    .from('courses')
    .insert({
      title: data.title,
      slug: data.slug,
      description: data.description,
      category: data.category,
      access_tier: data.access_tier,
      published: data.published,
      cover_image: data.cover_image ?? null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createCourse]', error.message);
    return null;
  }
  return created as Course;
}

export async function updateCourse(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    description: string;
    category: string;
    access_tier: AccessTier;
    published: boolean;
    cover_image: string | null;
  }>,
): Promise<Course | null> {
  const supabase = createAdminClient();
  const { data: updated, error } = await supabase
    .from('courses')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateCourse]', error.message);
    return null;
  }
  return updated as Course;
}

export async function deleteCourse(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error: lessonError } = await supabase
    .from('lessons')
    .delete()
    .eq('course_id', id);

  if (lessonError) {
    console.error('[deleteCourse:lessons]', lessonError.message);
    return false;
  }

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteCourse]', error.message);
    return false;
  }
  return true;
}

// ── Lessons ────────────────────────────────────────────────────────────────────

export async function getLessonsForAdminCourse(courseId: string): Promise<Lesson[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_number', { ascending: true });

  if (error) {
    console.error('[getLessonsForAdminCourse]', error.message);
    return [];
  }
  return (data ?? []) as Lesson[];
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getLessonById]', error.message);
    return null;
  }
  return data as Lesson;
}

export async function createLesson(data: {
  course_id: string;
  title: string;
  slug: string;
  order_number: number;
  body: string;
  video_url?: string | null;
  duration: number;
  published: boolean;
}): Promise<Lesson | null> {
  const supabase = createAdminClient();
  const { data: created, error } = await supabase
    .from('lessons')
    .insert({
      course_id: data.course_id,
      title: data.title,
      slug: data.slug,
      order_number: data.order_number,
      body: data.body,
      video_url: data.video_url ?? null,
      duration: data.duration,
      published: data.published,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createLesson]', error.message);
    return null;
  }
  return created as Lesson;
}

export async function updateLesson(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    order_number: number;
    body: string;
    video_url: string | null;
    duration: number;
    published: boolean;
  }>,
): Promise<Lesson | null> {
  const supabase = createAdminClient();
  const { data: updated, error } = await supabase
    .from('lessons')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateLesson]', error.message);
    return null;
  }
  return updated as Lesson;
}

export async function deleteLesson(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteLesson]', error.message);
    return false;
  }
  return true;
}

// ── Members ────────────────────────────────────────────────────────────────────

export async function getAllMembers(options?: {
  tier?: MemberTier;
  role?: MemberRole;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<Member[]> {
  const { tier, role, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (tier) search = search.eq('tier', tier);
  if (role) search = search.eq('role', role);
  if (searchPattern) search = search.ilike('email', searchPattern);

  const { data, error } = await search;
  if (error) {
    console.error('[getAllMembers]', error.message);
    return [];
  }
  return (data ?? []) as Member[];
}

export async function getAdminMemberById(id: string): Promise<Member | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getAdminMemberById]', error.message);
    return null;
  }
  return data as Member;
}

export async function updateAdminMember(
  id: string,
  data: Partial<Pick<Member, 'tier' | 'role'>>,
): Promise<Member | null> {
  const supabase = createAdminClient();
  const { data: updated, error } = await supabase
    .from('members')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateAdminMember]', error.message);
    return null;
  }
  return updated as Member;
}

export async function countAdminMembers(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin');

  if (error) {
    console.error('[countAdminMembers]', error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getMemberCount(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('[getMemberCount]', error.message);
    return 0;
  }
  return count ?? 0;
}

// ── Contact Submissions ───────────────────────────────────────────────────────

export async function getAllContactSubmissions(options?: {
  status?: ContactSubmissionStatus;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<ContactSubmission[]> {
  const { status, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('contact_submissions')
    .select('*')
    .order('submitted_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) search = search.eq('status', status);
  if (searchPattern) {
    search = search.or(
      `name.ilike.${searchPattern},email.ilike.${searchPattern},subject.ilike.${searchPattern},message.ilike.${searchPattern},internal_notes.ilike.${searchPattern}`,
    );
  }

  const { data, error } = await search;
  if (error) {
    console.error('[getAllContactSubmissions]', error.message);
    return [];
  }
  return (data ?? []) as ContactSubmission[];
}

export async function updateContactSubmission(
  id: string,
  data: {
    status: ContactSubmissionStatus;
    internal_notes?: string | null;
    handled_by?: string | null;
  },
): Promise<ContactSubmission | null> {
  const supabase = createAdminClient();
  const payload = {
    status: data.status,
    internal_notes: data.internal_notes?.trim() || null,
    handled_by: data.handled_by ?? null,
    handled_at: data.status === 'new' ? null : new Date().toISOString(),
  };

  const { data: updated, error } = await supabase
    .from('contact_submissions')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateContactSubmission]', error.message);
    return null;
  }
  return updated as ContactSubmission;
}

export async function getContactSubmissionCounts(): Promise<Record<ContactSubmissionStatus, number> & { total: number }> {
  const supabase = createAdminClient();
  const [total, nextNew, inProgress, resolved, spam] = await Promise.all([
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'spam'),
  ]);

  return {
    total: total.count ?? 0,
    new: nextNew.count ?? 0,
    in_progress: inProgress.count ?? 0,
    resolved: resolved.count ?? 0,
    spam: spam.count ?? 0,
  };
}

// ── Newsletter Subscribers ─────────────────────────────────────────────────────

export async function getAllSubscribers(options?: {
  active?: boolean;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<NewsletterSubscriber[]> {
  const { active, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (active === true) search = search.is('unsubscribed_at', null);
  if (active === false) search = search.not('unsubscribed_at', 'is', null);
  if (searchPattern) {
    search = search.or(`email.ilike.${searchPattern},source.ilike.${searchPattern}`);
  }

  const { data, error } = await search;
  if (error) {
    console.error('[getAllSubscribers]', error.message);
    return [];
  }
  return (data ?? []) as NewsletterSubscriber[];
}

export async function getSubscriberCounts(): Promise<{
  total: number;
  active: number;
  unsubscribed: number;
}> {
  const supabase = createAdminClient();
  const [total, active, unsubscribed] = await Promise.all([
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).is('unsubscribed_at', null),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).not('unsubscribed_at', 'is', null),
  ]);

  return {
    total: total.count ?? 0,
    active: active.count ?? 0,
    unsubscribed: unsubscribed.count ?? 0,
  };
}

// ── Dashboard counts ──────────────────────────────────────────────────────────

/**
 * Aggregate content counts for the admin dashboard overview.
 * Uses head-only queries for efficient counting.
 */
export async function getContentCounts(): Promise<{
  articles: { total: number; published: number; draft: number };
  briefings: { total: number; published: number; draft: number };
  courses: { total: number; published: number; draft: number };
  dispatches: { total: number; published: number; draft: number };
  downloads: { total: number };
  handbooks: { total: number; published: number; draft: number };
  members: { total: number };
  messages: { total: number };
  subscribers: { total: number };
}> {
  const supabase = createAdminClient();

  const [
    articlesTotal,
    articlesPublished,
    articlesDraft,
    briefingsTotal,
    briefingsPublished,
    briefingsDraft,
    coursesTotal,
    coursesPublished,
    coursesDraft,
    dispatchesTotal,
    dispatchesPublished,
    dispatchesDraft,
    downloadsTotal,
    handbooksTotal,
    handbooksPublished,
    handbooksDraft,
    membersTotal,
    messagesTotal,
    subscribersTotal,
  ] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('briefings').select('id', { count: 'exact', head: true }),
    supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', true),
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', false),
    supabase.from('dispatches').select('id', { count: 'exact', head: true }),
    supabase.from('dispatches').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('dispatches').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('downloads').select('id', { count: 'exact', head: true }),
    supabase.from('handbooks').select('id', { count: 'exact', head: true }),
    supabase.from('handbooks').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('handbooks').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('members').select('id', { count: 'exact', head: true }),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).is('unsubscribed_at', null),
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
    courses: {
      total: coursesTotal.count ?? 0,
      published: coursesPublished.count ?? 0,
      draft: coursesDraft.count ?? 0,
    },
    dispatches: {
      total: dispatchesTotal.count ?? 0,
      published: dispatchesPublished.count ?? 0,
      draft: dispatchesDraft.count ?? 0,
    },
    downloads: {
      total: downloadsTotal.count ?? 0,
    },
    handbooks: {
      total: handbooksTotal.count ?? 0,
      published: handbooksPublished.count ?? 0,
      draft: handbooksDraft.count ?? 0,
    },
    members: {
      total: membersTotal.count ?? 0,
    },
    messages: {
      total: messagesTotal.count ?? 0,
    },
    subscribers: {
      total: subscribersTotal.count ?? 0,
    },
  };
}
