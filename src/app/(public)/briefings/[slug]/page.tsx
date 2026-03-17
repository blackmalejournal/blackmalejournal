// src/app/(public)/briefings/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MagazineCoverHero from '@/components/content/MagazineCoverHero';
import {
  getBriefingBySlug,
  getBriefingByIssue,
} from '@/lib/supabase/queries';
import { checkContentAccess } from '@/lib/supabase/access';
import { formatDate } from '@/lib/utils';
import { SITE_URL, articleJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { StarDivider } from '@/components/ui/StarDivider';
import { ShareButton } from '@/components/ui/ShareButton';
import { PaywallGate } from '@/components/content/PaywallGate';
import type { Briefing } from '@/lib/supabase/types';

interface BriefingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: BriefingPageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const briefing = await getBriefingBySlug(slug);
  if (!briefing) return { title: 'Briefing Not Found' };

  const issueLabel = `No. ${String(briefing.issue_number).padStart(3, '0')}`;
  const description =
    briefing.sections[0]?.body.slice(0, 160) ?? briefing.title;

  return {
    title: `${issueLabel} — ${briefing.title}`,
    description,
    openGraph: {
      title: `Weekend Briefing ${issueLabel}: ${briefing.title}`,
      description,
      images: briefing.cover_image ? [{ url: briefing.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Weekend Briefing ${issueLabel}: ${briefing.title}`,
      description,
      images: briefing.cover_image ? [briefing.cover_image] : [],
    },
  };
}

function IssueNavigation({
  prev,
  next,
}: {
  prev: Briefing | null;
  next: Briefing | null;
}) {
  return (
    <nav
      aria-label="Issue navigation"
      className="mx-auto max-w-content border-t border-bmj-tan/20 px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        {prev ? (
          <Link
            href={`/briefings/${prev.slug}`}
            className="group flex flex-col no-underline"
          >
            <span className="mb-1 font-mono text-xs text-bmj-tan">
              ← Previous Issue
            </span>
            <span className="font-display text-xl text-bmj-cream transition-opacity group-hover:opacity-75">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            href={`/briefings/${next.slug}`}
            className="group flex flex-col items-start text-left no-underline sm:items-end sm:text-right"
          >
            <span className="mb-1 font-mono text-xs text-bmj-tan">
              Next Issue →
            </span>
            <span className="font-display text-xl text-bmj-cream transition-opacity group-hover:opacity-75">
              {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}

export default async function BriefingPage({ params }: BriefingPageProps) {
  const { slug } = await params;

  // Await briefing first (issue_number needed for adjacent queries),
  // then fan out prev/next in parallel.
  const briefing = await getBriefingBySlug(slug);
  if (!briefing) notFound();

  const [prevBriefing, nextBriefing] = await Promise.all([
    getBriefingByIssue(briefing.issue_number - 1),
    getBriefingByIssue(briefing.issue_number + 1),
  ]);

  const { hasAccess } = await checkContentAccess(briefing.access_tier);

  const issueLabel = `No. ${String(briefing.issue_number).padStart(3, '0')}`;
  // PaywallGate preview: first 300 chars of section[1] body if available, else section[0]
  const paywallPreview = briefing.sections[1]?.body.slice(0, 300)
    ?? briefing.sections[0]?.body.slice(0, 300)
    ?? '';

  return (
    <div className="mx-auto max-w-wide">
      <JsonLd
        data={articleJsonLd({
          title: `Weekend Briefing ${issueLabel}: ${briefing.title}`,
          description:
            briefing.sections[0]?.body.slice(0, 160) ?? briefing.title,
          url: `${SITE_URL}/briefings/${briefing.slug}`,
          imageUrl: briefing.cover_image,
          publishedAt: briefing.published_at,
        })}
      />

      {/* Back link */}
      <div className="mx-auto max-w-content px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/briefings"
          className="font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
        >
          ← All Briefings
        </Link>
      </div>

      {/* Magazine cover hero */}
      <MagazineCoverHero
        title={briefing.title}
        date={formatDate(briefing.published_at)}
        issueNumber={briefing.issue_number}
        coverImageUrl={briefing.cover_image || "/placeholder-briefing.jpg"}
      />

      {/* Sections */}
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        {hasAccess ? (
          // Full access: render all sections
          <>
            {briefing.sections.map((section, index) => (
              <div key={index}>
                {index > 0 && <StarDivider className="my-10" />}
                <section>
                  <div className="accent-border-top mb-6 pt-6">
                    <h2 className="font-display text-3xl text-bmj-white sm:text-4xl">
                      {section.title}
                    </h2>
                  </div>
                  <div className="mx-auto max-w-article">
                    <p className="whitespace-pre-line font-body text-lg leading-[1.9] text-bmj-cream/90">
                      {section.body}
                    </p>
                  </div>
                </section>
              </div>
            ))}
          </>
        ) : (
          // Gated: show first section only + paywall
          <div>
            {briefing.sections[0] && (
              <section className="mb-10">
                <div className="accent-border-top mb-6 pt-6">
                  <h2 className="font-display text-3xl text-bmj-white sm:text-4xl">
                    {briefing.sections[0].title}
                  </h2>
                </div>
                <div className="mx-auto max-w-article">
                  <p className="whitespace-pre-line font-body text-lg leading-[1.9] text-bmj-cream/90">
                    {briefing.sections[0].body}
                  </p>
                </div>
              </section>
            )}
            <PaywallGate
              requiredTier={briefing.access_tier}
              previewBody={paywallPreview}
            />
          </div>
        )}
      </div>

      {/* Share */}
      <div className="mx-auto max-w-content px-4 pb-8 sm:px-6 lg:px-8">
        <StarDivider className="mb-6" />
        <ShareButton />
      </div>

      <IssueNavigation prev={prevBriefing} next={nextBriefing} />
    </div>
  );
}
