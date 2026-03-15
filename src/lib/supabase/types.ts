// src/lib/supabase/types.ts
// NOTE: All row shapes are defined as `type` aliases (not `interface`) intentionally.
// TypeScript treats interfaces as "open" (subject to declaration merging), so they
// cannot satisfy `Record<string, unknown>` constraints that supabase-js uses internally
// to type INSERT/UPDATE operations. `type` aliases are closed and pass the check.

// ── Scalar enums ──────────────────────────────────────────────────────────────

export type Lens = 'health' | 'philosophy' | 'politics';
export type AccessTier = 'free' | 'basic' | 'premium';
export type MemberTier = 'free' | 'basic' | 'premium';

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
  cover_image: string | null;
  published_at: string;
  created_at: string;
};

export type Member = {
  id: string;
  email: string;
  tier: MemberTier;
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
  submitted_at: string;
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
        Insert: Omit<Member, 'id' | 'created_at'>;
        Update: Partial<Omit<Member, 'id' | 'created_at'>>;
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id' | 'created_at'>;
        Update: Partial<Omit<Course, 'id' | 'created_at'>>;
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
        Insert: Omit<ContactSubmission, 'id' | 'submitted_at'>;
        Update: Partial<Omit<ContactSubmission, 'id'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
