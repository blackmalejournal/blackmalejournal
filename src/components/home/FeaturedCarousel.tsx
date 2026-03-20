'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { StarDivider } from '@/components/ui/StarDivider';
import { LensBadge } from '@/components/brand/LensBadge';
import { BrandMark } from '@/components/brand/BrandMark';
import type { Article } from '@/lib/supabase/types';

interface FeaturedCarouselProps {
  articles: Article[];
}

const INTERVAL_MS = 6000;

export function FeaturedCarousel({ articles }: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % articles.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (articles.length === 0) {
    return (
      <section className="bg-bmj-black py-20">
        <div className="mx-auto max-w-content px-6">
          <StarDivider className="mb-8" />
          <h2 className="mb-12 text-center font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
            Featured
          </h2>
          <p className="text-center font-body text-base text-bmj-cream/50">
            Featured articles coming soon.
          </p>
        </div>
      </section>
    );
  }

  const article = articles[index];
  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="bg-bmj-black py-20">
      <div className="mx-auto max-w-content px-6">
        <StarDivider className="mb-8" />

        <h2 className="mb-12 text-center font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
          Featured
        </h2>

        <div className="relative min-h-[320px] overflow-hidden border border-bmj-tan/20 bg-bmj-brown sm:min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={article.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="flex min-h-[320px] flex-col sm:min-h-[400px] sm:flex-row"
            >
              {/* Image panel */}
              <div className="relative h-48 w-full overflow-hidden bg-bmj-black sm:h-auto sm:w-1/2">
                {article.cover_image ? (
                  <Image
                    src={article.cover_image}
                    alt={article.title}
                    fill
                    className="halftone object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BrandMark size={80} color="var(--bmj-cream)" className="opacity-10" />
                  </div>
                )}
              </div>

              {/* Content panel */}
              <div className="flex flex-1 flex-col justify-center p-8 sm:p-12">
                <LensBadge lens={article.lens} className="mb-4" />

                <h3 className="mb-4 font-display text-3xl leading-tight text-bmj-white sm:text-4xl">
                  {article.title}
                </h3>

                <p className="mb-6 line-clamp-3 font-body text-base leading-relaxed text-bmj-cream/70">
                  {article.excerpt}
                </p>

                <div className="mb-6 flex items-center gap-4">
                  <span className="font-label text-xs uppercase tracking-widest text-bmj-cream/60">
                    {article.author}
                  </span>
                  <span className="font-mono text-xs text-bmj-tan/60">
                    {formattedDate}
                  </span>
                </div>

                <Link
                  href={`/articles/${article.slug}`}
                  className="inline-block self-start border border-bmj-red px-6 py-3 font-label text-sm uppercase tracking-widest text-bmj-red transition-colors hover:bg-bmj-red hover:text-bmj-white"
                  aria-label="Read article"
                >
                  Read Article
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress indicators */}
          {articles.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
              role="tablist"
              aria-label="Featured article navigation"
            >
              {articles.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Article ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 transition-[width,background-color] duration-300 ${
                    i === index
                      ? 'w-8 bg-bmj-red'
                      : 'w-1.5 bg-bmj-tan/40 hover:bg-bmj-tan'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
