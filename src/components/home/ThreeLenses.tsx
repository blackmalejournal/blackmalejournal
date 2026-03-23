import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { getLensTheme } from "@/lib/lens-theme";
import { cn } from "@/lib/utils";
import type { Lens as LensSlug } from "@/lib/supabase/types";

interface Lens {
  slug: LensSlug;
  label: string;
  tagline: string;
  description: string;
}

const LENSES: Lens[] = [
  {
    slug: "health",
    label: "Health/Wellness",
    tagline: "Body. Mind. Discipline.",
    description:
      "Physical training, mental fortitude, ancestral wellness — the full spectrum of what it means to inhabit a Black male body with intention and mastery.",
  },
  {
    slug: "politics",
    label: "Politics/Law",
    tagline: "Power. Systems. Community.",
    description:
      "Power analysis, community organizing, policy critique — understanding the structures that govern Black life and strategizing how to transform them.",
  },
  {
    slug: "culture",
    label: "Culture/Ideology",
    tagline: "Art. Identity. Legacy.",
    description:
      "Culture is where a people define themselves. This lens covers ideology, identity, creative expression, and the cultural production that shapes and reflects the Black male experience.",
  },
  {
    slug: "entertainment",
    label: "Entertainment/Technology",
    tagline: "Screen. Sound. Platform.",
    description:
      "Music, film, sports, and technology — the industries that both represent and exploit Black talent. We analyze the economics, the narratives, and the leverage points.",
  },
  {
    slug: "commemoration",
    label: "Commemorations/Remembrance",
    tagline: "History. Memory. Honor.",
    description:
      "Anniversaries, milestones, and the figures who shaped Black male history. Remembrance is not nostalgia — it is the strategic preservation of a people's record.",
  },
];

export function ThreeLenses() {
  return (
    <section className="bg-bmj-black py-20">
      <div className="page-shell-tight">
        <PageHeader
          as="h2"
          tone="section"
          align="center"
          title="Five Lenses"
          label="Editorial Framework"
          description="The publication is organized across five domains of Black male life. Each lens carries its own argument, cadence, and editorial emphasis."
          dividerPosition="top"
          dividerClassName="mb-10"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LENSES.map((lens) => {
            const theme = getLensTheme(lens.slug);

            return (
              <Link
                key={lens.slug}
                href={`/articles?lens=${lens.slug}`}
                className={cn(
                  "group card-media block p-8 no-underline",
                  theme.cardBorderTop,
                  theme.hoverBorder,
                )}
              >
                <p className={cn("mb-3 font-label text-xs uppercase tracking-label", theme.accentText)}>
                  {lens.label}
                </p>
                <h3 className="mb-4 font-display text-2xl uppercase tracking-display text-bmj-white">
                  {lens.tagline}
                </h3>
                <p className="font-body text-sm leading-relaxed text-bmj-cream/70">
                  {lens.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
