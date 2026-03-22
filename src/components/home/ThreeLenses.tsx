import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { getLensTheme } from "@/lib/lens-theme";
import { cn } from "@/lib/utils";

type LensSlug = "health" | "philosophy" | "politics";

interface Lens {
  slug: LensSlug;
  label: string;
  tagline: string;
  description: string;
}

const LENSES: Lens[] = [
  {
    slug: "health",
    label: "Health",
    tagline: "Body. Mind. Discipline.",
    description:
      "Physical training, mental fortitude, ancestral wellness — the full spectrum of what it means to inhabit a Black male body with intention and mastery.",
  },
  {
    slug: "philosophy",
    label: "Philosophy",
    tagline: "Purpose. Identity. Truth.",
    description:
      "The examined life. We wrestle with identity, meaning, and the ancient questions that every conscious man must answer for himself before he can lead others.",
  },
  {
    slug: "politics",
    label: "Politics",
    tagline: "Power. Systems. Community.",
    description:
      "Power analysis, community organizing, policy critique — understanding the structures that govern Black life and strategizing how to transform them.",
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
          title="Three Lenses"
          label="Editorial Framework"
          description="The publication is organized around body, mind, and power. Each lens carries its own argument, cadence, and editorial emphasis."
          dividerPosition="top"
          dividerClassName="mb-10"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                <p className={cn("mb-3 font-label text-xs uppercase tracking-[0.18em]", theme.accentText)}>
                  {lens.label}
                </p>
                <h3 className="mb-4 font-display text-2xl uppercase tracking-[0.04em] text-bmj-white">
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
