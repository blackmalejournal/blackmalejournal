import Link from "next/link";
import { StarDivider } from "@/components/ui/StarDivider";

type LensSlug = "health" | "philosophy" | "politics";

interface Lens {
  slug: LensSlug;
  label: string;
  tagline: string;
  description: string;
  borderClass: string;
  textClass: string;
}

const LENSES: Lens[] = [
  {
    slug: "health",
    label: "Health",
    tagline: "Body. Mind. Discipline.",
    description:
      "Physical training, mental fortitude, ancestral wellness — the full spectrum of what it means to inhabit a Black male body with intention and mastery.",
    borderClass: "border-t-4 border-bmj-amber",
    textClass: "text-bmj-amber",
  },
  {
    slug: "philosophy",
    label: "Philosophy",
    tagline: "Purpose. Identity. Truth.",
    description:
      "The examined life. We wrestle with identity, meaning, and the ancient questions that every conscious man must answer for himself before he can lead others.",
    borderClass: "border-t-4 border-bmj-tan",
    textClass: "text-bmj-tan",
  },
  {
    slug: "politics",
    label: "Politics",
    tagline: "Power. Systems. Community.",
    description:
      "Power analysis, community organizing, policy critique — understanding the structures that govern Black life and strategizing how to transform them.",
    borderClass: "border-t-4 border-bmj-red",
    textClass: "text-bmj-red",
  },
];

export function ThreeLenses() {
  return (
    <section className="bg-bmj-black py-20">
      <div className="mx-auto max-w-content px-6">
        <StarDivider className="mb-8" />

        <h2 className="mb-12 text-center font-label text-sm uppercase tracking-[0.3em] text-bmj-tan">
          Three Lenses
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {LENSES.map((lens) => (
            <Link
              key={lens.slug}
              href={`/articles?lens=${lens.slug}`}
              className={`group block border border-transparent bg-bmj-brown p-8 no-underline transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-bmj-red ${lens.borderClass}`}
            >
              <p className={`mb-2 font-label text-xs uppercase tracking-widest ${lens.textClass}`}>
                {lens.label}
              </p>
              <h3 className="mb-4 font-display text-2xl text-bmj-white">{lens.tagline}</h3>
              <p className="font-body text-sm leading-relaxed text-bmj-cream/70">
                {lens.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
