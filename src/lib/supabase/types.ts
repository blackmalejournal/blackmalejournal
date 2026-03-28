// src/lib/supabase/types.ts
// NOTE: All row shapes are defined as `type` aliases (not `interface`) intentionally.
// TypeScript treats interfaces as "open" (subject to declaration merging), so they
// cannot satisfy `Record<string, unknown>` constraints that supabase-js uses internally
// to type INSERT/UPDATE operations. `type` aliases are closed and pass the check.

// ── Scalar enums ──────────────────────────────────────────────────────────────

export type Lens =
  | 'health'
  | 'politics'
  | 'culture'
  | 'entertainment'
  | 'business';
export type CourseCategory = 'martial-arts' | 'mental-health' | 'relationships' | 'purpose' | 'branding';
export type AccessTier = 'free' | 'basic' | 'premium';
export type MemberTier = 'free' | 'basic' | 'premium';
export type PaidMemberTier = Exclude<MemberTier, 'free'>;
export type ContentStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'withdrawn';
export type MemberRole = 'member' | 'editor' | 'admin';
export type ContactSubmissionStatus = 'new' | 'in_progress' | 'resolved' | 'spam';
export type AdminActivityEntityType = 'article' | 'briefing' | 'dispatch' | 'handbook' | 'download';
export type AdminActivityAction = 'created' | 'updated' | 'deleted';

export type BriefingSection = {
  title: string;
  body: string;
};

// ── Application row types ─────────────────────────────────────────────────────

export type Article = {
  id: string;
  title: string;
  slug: string;
  lens: Lens;
  tags: string[];
  excerpt: string;
  body: string;
  featured: boolean;
  access_tier: AccessTier;
  status: ContentStatus;
  author: string;
  cover_image: string | null;
  published_at: string;
  created_at: string;
};

export type Briefing = {
  id: string;
  issue_number: number;
  title: string;
  slug: string;
  sections: BriefingSection[];
  access_tier: AccessTier;
  status: ContentStatus;
  cover_image: string | null;
  published_at: string;
  created_at: string;
};

export type Member = {
  id: string;
  email: string;
  tier: MemberTier;
  role: MemberRole;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  access_tier: AccessTier;
  published: boolean;
  cover_image: string | null;
  created_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  order_number: number;
  body: string;
  video_url: string | null;
  duration: number;
  published: boolean;
  created_at: string;
};

export type Dispatch = {
  id: string;
  title: string;
  slug: string;
  lens: Lens;
  excerpt: string;
  body: string;
  status: ContentStatus;
  author: string;
  cover_image: string | null;
  published_at: string;
  created_at: string;
};

export type Handbook = {
  id: string;
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
  created_at: string;
};

export type Download = {
  id: string;
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
  created_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  source: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: ContactSubmissionStatus;
  internal_notes: string | null;
  handled_at: string | null;
  handled_by: string | null;
  submitted_at: string;
};

export type AdminActivityLog = {
  id: string;
  actor_user_id: string | null;
  actor_email: string;
  actor_role: MemberRole;
  entity_type: AdminActivityEntityType;
  entity_id: string;
  entity_title: string;
  action: AdminActivityAction;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

// ── Member Bookmarks ──────────────────────────────────────────────────────────

export type MemberBookmark = {
  id: string;
  member_id: string;
  content_type: string;
  content_id: string;
  created_at: string;
};

// ── Search ───────────────────────────────────────────────────────────────────

export type SearchContentType = 'article' | 'briefing' | 'handbook' | 'dispatch';

export type SearchResult = {
  type: SearchContentType;
  title: string;
  slug: string;
  excerpt: string;
  lens?: Lens;
  accessTier?: AccessTier;
  publishedAt: string;
  relevance?: number;
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export type BookmarkedItem = {
  bookmarkId: string;
  contentType: SearchContentType;
  contentId: string;
  title: string;
  slug: string;
  lens?: Lens;
  accessTier?: AccessTier;
  publishedAt: string;
  bookmarkedAt: string;
};

// ── Campaigns ────────────────────────────────────────────────────────────────

export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed';
export type AudienceFilter = { source?: string; activeOnly?: boolean };
export type Campaign = {
  id: string;
  title: string;
  subject: string;
  body: string;
  audience_filter: AudienceFilter;
  recipient_count: number;
  status: CampaignStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

// ── Database generic (required by @supabase/supabase-js typed client) ─────────
// Maps table names to their Row/Insert/Update shapes so every
// supabase.from('articles').select() call returns Article[] automatically.

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at'>;
        Update: Partial<Omit<Article, 'id' | 'created_at'>>;
        Relationships: [];
      };
      briefings: {
        Row: Briefing;
        Insert: Omit<Briefing, 'id' | 'created_at'>;
        Update: Partial<Omit<Briefing, 'id' | 'created_at'>>;
        Relationships: [];
      };
      members: {
        Row: Member;
        Insert: Omit<Member, 'created_at'>;
        Update: Partial<Omit<Member, 'id' | 'created_at'>>;
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id' | 'created_at'>;
        Update: Partial<Omit<Course, 'id' | 'created_at'>>;
        Relationships: [];
      };
      lessons: {
        Row: Lesson;
        Insert: Omit<Lesson, 'id' | 'created_at'>;
        Update: Partial<Omit<Lesson, 'id' | 'created_at'>>;
        Relationships: [];
      };
      dispatches: {
        Row: Dispatch;
        Insert: Omit<Dispatch, 'id' | 'created_at'>;
        Update: Partial<Omit<Dispatch, 'id' | 'created_at'>>;
        Relationships: [];
      };
      handbooks: {
        Row: Handbook;
        Insert: Omit<Handbook, 'id' | 'created_at'>;
        Update: Partial<Omit<Handbook, 'id' | 'created_at'>>;
        Relationships: [];
      };
      downloads: {
        Row: Download;
        Insert: Omit<Download, 'id' | 'created_at'>;
        Update: Partial<Omit<Download, 'id' | 'created_at'>>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, 'id' | 'subscribed_at'>;
        Update: Partial<Omit<NewsletterSubscriber, 'id'>>;
        Relationships: [];
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: Omit<ContactSubmission, 'id' | 'submitted_at' | 'status' | 'internal_notes' | 'handled_at' | 'handled_by'>;
        Update: Partial<Omit<ContactSubmission, 'id'>>;
        Relationships: [];
      };
      admin_activity_log: {
        Row: AdminActivityLog;
        Insert: Omit<AdminActivityLog, 'id' | 'created_at'>;
        Update: Partial<Omit<AdminActivityLog, 'id' | 'created_at'>>;
        Relationships: [];
      };
      member_bookmarks: {
        Row: MemberBookmark;
        Insert: Omit<MemberBookmark, 'id' | 'created_at'>;
        Update: Partial<Omit<MemberBookmark, 'id' | 'created_at'>>;
        Relationships: [];
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Campaign, 'id' | 'created_at'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
