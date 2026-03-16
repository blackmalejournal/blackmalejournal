import Link from "next/link";

export function JoinCTA() {
  return (
    <section className="accent-border-top accent-border-bottom bg-bmj-black py-20">
      <div className="mx-auto max-w-content px-6 text-center">
        <h2 className="mb-6 font-display text-5xl text-bmj-white md:text-7xl">
          Join the Movement
        </h2>

        <p className="mx-auto mb-12 max-w-xl font-body text-base leading-relaxed text-bmj-cream/70 md:text-lg">
          Get access to the Weekend Briefing, handbooks, member forums, and a growing archive built
          for the deliberate Black man.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="border border-bmj-cream px-8 py-4 font-label text-sm uppercase tracking-widest text-bmj-cream no-underline transition-colors hover:border-bmj-white hover:text-bmj-white"
          >
            Subscribe Free
          </Link>
          <Link
            href="/signup?tier=premium"
            className="bg-bmj-red px-8 py-4 font-label text-sm uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90"
          >
            Go Premium
          </Link>
        </div>
      </div>
    </section>
  );
}
