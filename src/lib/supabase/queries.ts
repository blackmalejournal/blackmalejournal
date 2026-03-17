// src/lib/supabase/queries.ts
// NOTE: Several return sites cast `data` to the explicit row type (e.g. `as Article[]`).
// supabase-js v2.99's column-parser for select('*') with custom Database types infers
// the result as `{}[]` rather than the full row type. The cast is safe: the runtime
// data is always the full row because select('*') fetches all columns.
import { createClient } from '@/lib/supabase/server';
import type {
  Article,
  Briefing,
  Course,
  Dispatch,
  Download,
  Handbook,
  Lesson,
  Member,
  MemberTier,
  Lens,
  AccessTier,
} from '@/lib/supabase/types';

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

  let query = supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

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

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Article;
}

export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getFeaturedArticles]', error.message);
    return [];
  }
  return (data ?? []) as Article[];
}

export async function getLatestArticles(limit = 10): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getLatestArticles]', error.message);
    return [];
  }
  return (data ?? []) as Article[];
}

// ── Briefings ─────────────────────────────────────────────────────────────────

export async function getBriefings(
  options: { limit?: number; offset?: number } = {},
): Promise<Briefing[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .order('issue_number', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[getBriefings]', error.message);
    return [];
  }
  return (data ?? []) as Briefing[];
}

export async function getBriefingBySlug(
  slug: string,
): Promise<Briefing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Briefing;
}

export async function getLatestBriefing(): Promise<Briefing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .order('issue_number', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as Briefing;
}

export async function getBriefingByIssue(
  issueNumber: number,
): Promise<Briefing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .eq('issue_number', issueNumber)
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

export async function getCourses(
  options: { category?: string; published?: boolean } = {},
): Promise<Course[]> {
  const { category, published } = options;
  const supabase = await createClient();

  let query = supabase
    .from('courses')
    .select('*')
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

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Course;
}

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

export async function getLessonBySlug(
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
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export async function subscribeToNewsletter(
  email: string,
  source?: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email, source: source ?? null, unsubscribed_at: null },
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
    .eq('email', email);

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

export async function getDispatches(
  options: { limit?: number; offset?: number } = {},
): Promise<Dispatch[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dispatches')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[getDispatches]', error.message);
    return [];
  }
  return (data ?? []) as Dispatch[];
}

export async function getDispatchBySlug(
  slug: string,
): Promise<Dispatch | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dispatches')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Dispatch;
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

  let query = supabase
    .from('handbooks')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (lens) query = query.eq('lens', lens);

  const { data, error } = await query;
  if (error) {
    console.error('[getHandbooks]', error.message);
    return [];
  }
  return (data ?? []) as Handbook[];
}

export async function getHandbookBySlug(slug: string): Promise<Handbook | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('handbooks')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Handbook;
}

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
