import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCourseBySlug } from '@/lib/supabase/queries';
import { getCategoryLabel } from '@/lib/utils';
import { StarDivider } from '@/components/ui/StarDivider';

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: CoursePageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: 'Course Not Found' };

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: course.cover_image ? [{ url: course.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: course.title,
      description: course.description,
      images: course.cover_image ? [course.cover_image] : [],
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-article px-4 py-16 sm:px-6 lg:px-8">
      <span className="inline-block rounded-sm border border-bmj-tan/40 px-2 py-0.5 font-label text-xs uppercase tracking-widest text-bmj-tan">
        {getCategoryLabel(course.category)}
      </span>

      <h1 className="mt-4 font-display text-5xl text-bmj-white">
        {course.title}
      </h1>

      <p className="mt-6 font-body text-lg leading-relaxed text-bmj-cream/80">
        {course.description}
      </p>

      {course.cover_image && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-bmj-black">
          <Image
            src={course.cover_image}
            alt={course.title}
            fill
            className="halftone object-cover"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
      )}

      <StarDivider className="my-10" />

      <p className="font-body italic text-bmj-tan">
        {course.published
          ? 'Lessons coming soon.'
          : 'This course is currently in development. Check back soon.'}
      </p>

      <Link
        href="/academy"
        className="mt-8 inline-block font-label text-sm uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
      >
        &larr; Back to Academy
      </Link>
    </div>
  );
}
