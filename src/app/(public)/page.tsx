// src/app/(public)/page.tsx
import type { Metadata } from "next";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ThreeLenses } from "@/components/home/ThreeLenses";
import { BriefingPreview } from "@/components/home/BriefingPreview";
import { FeaturedArticles } from "@/components/home/FeaturedArticles";
import { RotatingQuote } from "@/components/home/RotatingQuote";
import { JoinCTA } from "@/components/home/JoinCTA";
import { getLatestBriefing, getFeaturedArticles } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  description:
    "Independent media house and revolutionary masculinist platform covering health, philosophy, and politics for Black men.",
  openGraph: {
    title: "The Black Male Journal",
    description:
      "Independent media house and revolutionary masculinist platform covering health, philosophy, and politics for Black men.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Black Male Journal",
    description:
      "Independent media house and revolutionary masculinist platform covering health, philosophy, and politics for Black men.",
  },
};

export default async function HomePage() {
  const [briefing, articles] = await Promise.all([
    getLatestBriefing(),
    getFeaturedArticles(3),
  ]);

  return (
    <>
      <HeroBanner />
      <ThreeLenses />
      <BriefingPreview briefing={briefing} />
      <FeaturedArticles articles={articles} />
      <RotatingQuote />
      <JoinCTA />
    </>
  );
}
