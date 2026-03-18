import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, FileText, Zap, GraduationCap, Play } from "lucide-react";
import { StarDivider } from "@/components/ui/StarDivider";

export const metadata: Metadata = {
  title: "Library",
  description:
    "The full content library of The Black Male Journal — briefings, articles, dispatches, academy, and video.",
  openGraph: {
    title: "Library",
    description:
      "The full content library of The Black Male Journal — briefings, articles, dispatches, academy, and video.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Library",
    description:
      "The full content library of The Black Male Journal — briefings, articles, dispatches, academy, and video.",
  },
};

const hubs = [
  {
    icon: BookOpen,
    label: "Flagship Publication",
    title: "Weekend Briefings",
    description:
      "Our flagship weekly publication. A curated briefing on the issues, ideas, and culture shaping Black male life.",
    href: "/briefings",
  },
  {
    icon: FileText,
    label: "Long-Form Analysis",
    title: "Articles",
    description:
      "Long-form analysis across three lenses: health, philosophy, and politics.",
    href: "/articles",
  },
  {
    icon: Zap,
    label: "Short-Form Commentary",
    title: "Dispatches",
    description:
      "Short-form commentary and rapid analysis. The field notes of revolutionary media.",
    href: "/blog",
  },
  {
    icon: GraduationCap,
    label: "Structured Learning",
    title: "Academy",
    description:
      "Structured learning: courses in martial arts, mental health, relationships, purpose, and personal branding.",
    href: "/academy",
  },
  {
    icon: Play,
    label: "Documentary Video",
    title: "Video",
    description: "Documentary-style video content. Watch. Learn. Build.",
    href: "/video",
  },
];

const lenses = [
  { label: "Health", href: "/articles?lens=health" },
  { label: "Philosophy", href: "/articles?lens=philosophy" },
  { label: "Politics", href: "/articles?lens=politics" },
];

export default function LibraryPage() {
  return (
    <>
      <section className="mx-auto max-w-content px-6 py-16">
        <p className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Content Library
        </p>
        <h1 className="mb-4 font-display text-5xl uppercase text-bmj-white md:text-7xl">
          Library
        </h1>
        <p className="max-w-xl font-body text-sm leading-relaxed text-bmj-cream/70">
          Everything published under The Black Male Journal banner — in one
          place. Briefings, long reads, dispatches, courses, and video. Start
          where it matters to you.
        </p>
      </section>

      <StarDivider className="mx-auto max-w-content px-6" />

      <section className="mx-auto max-w-content px-6 py-16">
        <p className="mb-8 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Content Sections
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map(({ icon: Icon, label, title, description, href }) => (
            <Link
              key={href}
              href={href}
              className="group block border-t-[3px] border-bmj-red bg-bmj-brown p-8 transition-transform hover:-translate-y-1"
            >
              <p className="mb-3 font-label text-xs uppercase tracking-widest text-bmj-tan">
                {label}
              </p>
              <div className="mb-4 flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0 text-bmj-red" strokeWidth={1.5} />
                <h2 className="font-display text-2xl uppercase text-bmj-white">
                  {title}
                </h2>
              </div>
              <p className="font-body text-sm leading-relaxed text-bmj-cream/70">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <StarDivider className="mx-auto max-w-content px-6" />

      <section className="mx-auto max-w-content px-6 py-16">
        <p className="mb-6 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Browse by Lens
        </p>
        <div className="flex flex-wrap gap-4">
          {lenses.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="border border-bmj-tan/30 bg-bmj-brown px-6 py-3 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <StarDivider className="mx-auto max-w-content px-6" />

      <section className="mx-auto max-w-content px-6 py-16">
        <p className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Independent Media
        </p>
        <h2 className="mb-4 font-display text-4xl uppercase text-bmj-white md:text-5xl">
          Keep This Going
        </h2>
        <p className="mb-8 max-w-lg font-body text-sm leading-relaxed text-bmj-cream/70">
          No sponsors. No advertisers. The Black Male Journal runs on direct
          reader support. If this work matters to you, fund it.
        </p>
        <Link
          href="/support"
          className="inline-block bg-bmj-red px-8 py-4 font-label text-sm uppercase tracking-widest text-bmj-white transition-colors hover:bg-bmj-red/80"
        >
          Support the Mission
        </Link>
      </section>
    </>
  );
}
