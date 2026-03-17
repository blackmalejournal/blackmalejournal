// src/components/home/HeroBanner.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-bmj-black">
      {/* Large star watermark — low opacity background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ opacity: 0.025 }}
      >
        <svg
          width="700"
          height="700"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 0L19.6 11.6H32L21.8 18.4L25.4 30L16 23.2L6.6 30L10.2 18.4L0 11.6H12.4L16 0Z"
            fill="var(--bmj-cream)"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-content px-6 py-24 text-center">
        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-display text-6xl leading-none tracking-wide text-bmj-white sm:text-7xl md:text-9xl"
        >
          THE BLACK MALE JOURNAL
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-6 font-body text-base italic text-bmj-cream/70 md:text-xl"
        >
          Independent Media House · Revolutionary Masculinist Platform
        </motion.p>

        {/* Red accent line + mission + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <div className="mx-auto my-8 h-px w-24 bg-bmj-red" />

          <p className="mx-auto max-w-2xl font-body text-base leading-relaxed text-bmj-cream/70 md:text-lg">
            We chronicle the full complexity of Black male life — mind, body, and power. No
            apology. No dilution. This is the record of men who choose to be deliberate.
          </p>

          <div className="mt-12">
            <Link
              href="/briefings"
              className="inline-block btn-primary btn-lg"
            >
              Read the Latest Briefing
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
