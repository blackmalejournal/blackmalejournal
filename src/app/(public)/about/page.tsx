import type { Metadata } from 'next';
import Link from 'next/link';
import { StarDivider } from '@/components/ui/StarDivider';
import TributeCard from '@/components/content/TributeCard';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Revolutionary masculinist media documenting Black male life through research, reflection, and defiance.',
  openGraph: {
    title: 'About The Black Male Journal',
    description:
      'Revolutionary masculinist media documenting Black male life through research, reflection, and defiance.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About The Black Male Journal',
    description:
      'Revolutionary masculinist media documenting Black male life through research, reflection, and defiance.',
  },
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-content px-6 py-16">

      <div className="max-w-article">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-bmj-tan">
          Independent Media — Est. 2024
        </p>
        <h1 className="mb-6 font-display text-5xl uppercase text-bmj-white md:text-7xl">
          About
        </h1>
        <p className="font-body text-lg leading-[1.8] text-bmj-cream/80">
          Revolutionary masculinist media documenting Black male life through
          research, reflection, and defiance.
        </p>
      </div>

      <StarDivider className="my-12" />

      <div className="max-w-article space-y-6">
        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          The Mission
        </p>
        <h2 className="font-display text-4xl uppercase text-bmj-white md:text-5xl">
          Why We Exist
        </h2>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          We exist because Black male life has never been adequately documented
          on its own terms. Not by mainstream media, not by institutions, and
          not by platforms optimized for outrage over understanding. The Black
          Male Journal was founded to fill that void with precision, integrity,
          and an uncompromising commitment to the men it serves.
        </p>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          We are not a lifestyle brand. We are not a debate forum. We are an
          independent media house — producing long-form analysis, weekly
          briefings, and archival commentary that treats Black men as thinkers,
          builders, and historical subjects worthy of serious study. Our work
          operates across three domains: the body, the mind, and the system.
          Health, philosophy, and politics. Every article, every briefing, every
          resource we publish answers to one of these three lenses.
        </p>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          We accept no corporate sponsors. We carry no advertisers. Our
          independence is not a marketing angle — it is the condition under
          which honest work becomes possible. This publication runs on reader
          support and the discipline of a singular editorial vision.
        </p>
      </div>

      <StarDivider className="my-12" />

      <div className="max-w-article space-y-6">
        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          The Editor
        </p>
        <h2 className="font-display text-4xl uppercase text-bmj-white md:text-5xl">
          The Chairman
        </h2>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          The Chairman is the founder, sole author, and editorial director of
          The Black Male Journal. Every article, briefing, and analysis
          published on this platform is written by him. There is no editorial
          board, no rotating contributors, no algorithmic content calendar. The
          voice you encounter across these pages is one voice — consistent,
          intentional, and accountable.
        </p>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          His work draws from disciplines that rarely appear in the same
          sentence: political theory, physical discipline, historical
          documentation, and the lived experience of Black manhood in the
          contemporary world. He writes from inside the subject, not above it.
          The Chairman does not position himself as an authority external to the
          community — he is of it, writing for it, and accountable to it.
        </p>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          The Chairman does not offer hot takes. He offers studied positions,
          revised when the evidence demands it, defended until it does.
        </p>
      </div>

      <StarDivider className="my-12" />

      <div className="space-y-8">
        <div>
          <p className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
            Ancestors &amp; Architects
          </p>
          <h2 className="mb-8 font-display text-4xl uppercase text-bmj-white md:text-5xl">
            We Honor Those Who Built the Road
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TributeCard
            name="Dr. Amos N. Wilson"
            honorific="Pan-Africanist Psychologist"
            dates="1941 — 1995"
            description="One of the most eloquent and precise pedagogues the Black Power Movement produced. His work on the psychology of Black male development remains foundational to everything we publish."
          />
          <TributeCard
            name="Rev. Jesse L. Jackson Sr."
            honorific="The Reverend"
            dates="Oct. 8, 1941 — Feb. 17, 2026"
            description="A lifetime of service to the cause of Black political empowerment. His insistence on dignity, his refusal to accept the unacceptable, and his willingness to stand where others would not."
          />
        </div>
      </div>

      <StarDivider className="my-12" />

      <div className="space-y-12">
        <div>
          <p className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
            The Framework
          </p>
          <h2 className="mb-8 font-display text-4xl uppercase text-bmj-white md:text-5xl">
            The Three Lenses
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="border-t-2 border-bmj-red pt-6">
            <p className="mb-3 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Lens I
            </p>
            <h3 className="mb-4 font-display text-3xl uppercase text-bmj-white">
              Health
            </h3>
            <p className="font-body text-sm leading-relaxed text-bmj-cream/80">
              The body is the first site of sovereignty. This lens covers
              physical discipline, martial arts, nutrition, mental wellness, and
              the cultivation of the kind of physical self-mastery that colonial
              systems have always worked to prevent. Health at BMJ is not
              self-help. It is a political act — the refusal to surrender the
              body to stress, stagnation, and the slow violence of neglect.
            </p>
          </div>

          <div className="border-t-2 border-bmj-red pt-6">
            <p className="mb-3 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Lens II
            </p>
            <h3 className="mb-4 font-display text-3xl uppercase text-bmj-white">
              Philosophy
            </h3>
            <p className="font-body text-sm leading-relaxed text-bmj-cream/80">
              Before a man can change his world, he must have a coherent account
              of himself in it. This lens explores identity, purpose,
              masculinity, moral reasoning, and the intellectual traditions that
              have shaped Black male thought across centuries and continents.
              Philosophy here is not academic performance — it is the ongoing,
              demanding work of deciding who you are and refusing to let anyone
              else decide for you.
            </p>
          </div>

          <div className="border-t-2 border-bmj-red pt-6">
            <p className="mb-3 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Lens III
            </p>
            <h3 className="mb-4 font-display text-3xl uppercase text-bmj-white">
              Politics
            </h3>
            <p className="font-body text-sm leading-relaxed text-bmj-cream/80">
              Power does not wait for you to understand it. This lens examines
              policy, institutional design, historical systems of control,
              community organizing, and the mechanics of political power as they
              bear specifically on Black male life. The analysis here is cold,
              structural, and strategic. We document how systems work and how
              they can be worked — or dismantled.
            </p>
          </div>
        </div>
      </div>

      <StarDivider className="my-12" />

      <div className="max-w-article space-y-8">
        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Continue
        </p>
        <h2 className="font-display text-4xl uppercase text-bmj-white md:text-5xl">
          Enter the Archive
        </h2>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          The work is here. Read the articles. Subscribe to the Weekend
          Briefing. If this publication matters to you, support it directly.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/articles"
            className="bg-bmj-red px-8 py-4 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Read Articles
          </Link>
          <Link
            href="/briefings"
            className="border border-bmj-tan/40 px-8 py-4 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
          >
            Weekend Briefing
          </Link>
          <Link
            href="/support"
            className="border border-bmj-tan/40 px-8 py-4 font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
          >
            Support the Mission
          </Link>
        </div>
      </div>

    </section>
  );
}
