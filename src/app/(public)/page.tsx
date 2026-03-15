// src/app/(public)/page.tsx
import { HeroBanner } from "@/components/home/HeroBanner";
import { ThreeLenses } from "@/components/home/ThreeLenses";
import { BriefingPreview } from "@/components/home/BriefingPreview";
import { FeaturedArticles } from "@/components/home/FeaturedArticles";
import { RotatingQuote } from "@/components/home/RotatingQuote";
import { JoinCTA } from "@/components/home/JoinCTA";
import { getLatestBriefing, getFeaturedArticles } from "@/lib/supabase/queries";

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
