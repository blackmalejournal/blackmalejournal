import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getCourseBySlug,
  getLessonBySlug,
  getLessonsByCourse,
} from '@/lib/supabase/queries';
import { checkContentAccess } from '@/lib/supabase/access';
import { calculateReadingTime } from '@/lib/utils';
import { StarDivider } from '@/components/ui/StarDivider';
import { ArticleBody } from '@/components/content/ArticleBody';
import { PaywallGate } from '@/components/content/PaywallGate';

interface LessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export async function generateMetadata(
  { params }: LessonPageProps,
): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: 'Lesson Not Found' };

  const lesson = await getLessonBySlug(course.id, lessonSlug);
  if (!lesson) return { title: 'Lesson Not Found' };

  const title = `${lesson.title} — ${course.title}`;
  const images = course.cover_image ? [{ url: course.cover_image }] : [];
  return {
    title,
    description: course.description,
    openGraph: { title, description: course.description, images },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description: course.description,
      images: course.cover_image ? [course.cover_image] : [],
    },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonSlug } = await params;

  const course = await getCourseBySlug(slug);
  if (!course || !course.published) notFound();

  const lesson = await getLessonBySlug(course.id, lessonSlug);
  if (!lesson) notFound();

  const { hasAccess, user } = await checkContentAccess(course.access_tier);
  const readingTime = calculateReadingTime(lesson.body);
  const previewBody = lesson.body.slice(0, 300);

  // Fetch all lessons for prev/next navigation
  const allLessons = await getLessonsByCourse(course.id);
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const paddedNumber = String(lesson.order_number).padStart(2, '0');

  return (
    <div className="mx-auto max-w-article px-4 py-16 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
        <Link href="/academy" className="hover:text-bmj-cream">
          Academy
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/academy/${course.slug}`} className="hover:text-bmj-cream">
          {course.title}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-bmj-cream">Lesson {paddedNumber}</span>
      </nav>

      {/* Header */}
      <header>
        <span className="font-mono text-sm text-bmj-tan">
          Lesson {paddedNumber}
        </span>
        <h1 className="mt-2 font-display text-4xl leading-tight text-bmj-white sm:text-5xl">
          {lesson.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="font-mono text-xs text-bmj-tan">
            {readingTime} min read
            {lesson.duration > 0 && ` · ${lesson.duration} min video`}
          </span>
        </div>
        <div className="mt-6 accent-border-bottom pb-0" />
      </header>

      <StarDivider className="my-10" />

      {/* Video embed */}
      {hasAccess && lesson.video_url && (
        <div className="relative mb-10 aspect-video overflow-hidden bg-bmj-black">
          <iframe
            src={lesson.video_url}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full"
          />
        </div>
      )}

      {/* Body or paywall */}
      {hasAccess ? (
        <ArticleBody body={lesson.body} />
      ) : (
        <PaywallGate
          requiredTier={course.access_tier}
          previewBody={previewBody}
          isLoggedIn={!!user}
        />
      )}

      <StarDivider className="my-10" />

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between">
        {prevLesson ? (
          <Link
            href={`/academy/${course.slug}/${prevLesson.slug}`}
            className="font-label text-sm uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
          >
            &larr; Lesson {String(prevLesson.order_number).padStart(2, '0')}
          </Link>
        ) : (
          <Link
            href={`/academy/${course.slug}`}
            className="font-label text-sm uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
          >
            &larr; Course Overview
          </Link>
        )}

        {nextLesson ? (
          <Link
            href={`/academy/${course.slug}/${nextLesson.slug}`}
            className="font-label text-sm uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
          >
            Lesson {String(nextLesson.order_number).padStart(2, '0')} &rarr;
          </Link>
        ) : (
          <Link
            href={`/academy/${course.slug}`}
            className="font-label text-sm uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
          >
            Back to Course &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
