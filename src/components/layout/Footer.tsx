// src/components/layout/Footer.tsx
import Link from "next/link";
import { NewsletterForm } from './NewsletterForm';
import { Instagram, Youtube, Linkedin, Twitter } from "lucide-react";
import { BrandMark } from '@/components/brand/BrandMark';
import { FOOTER_NAV_LINKS } from '@/lib/nav';

const SOCIAL_LINKS = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube,   href: "#", label: "YouTube" },
  { icon: Linkedin,  href: "#", label: "LinkedIn" },
  { icon: Twitter,   href: "#", label: "Twitter / X" },
];

const DIRECT_SUPPORT_LINKS = [
  { label: "PayPal",   href: "https://paypal.me/BlackMaleJournal" },
  { label: "CashApp",  href: "https://cash.app/$BlackMaleJournal" },
  { label: "Venmo",    href: "https://venmo.com/BlackMaleJournal" },
];

export function Footer() {
  return (
    <footer className="accent-border-top bg-bmj-deep-black">
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* Column 1 — Brand */}
          <div className="surface-panel flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <BrandMark size={28} color="var(--bmj-red)" />
              <div className="flex flex-col">
                <span className="font-display text-lg uppercase tracking-wordmark text-bmj-white">
                  The Black Male Journal
                </span>
                <p className="mt-1 font-label text-xs uppercase tracking-label text-bmj-tan/70">
                  Speak the Truth. Navigate the Consequences.
                </p>
              </div>
            </div>
            <p className="font-body text-sm leading-relaxed text-bmj-cream/70">
              Independent media house. Revolutionary masculinist platform covering
              health, philosophy, and politics for Black men.
            </p>

            {/* Patreon — patronage channel */}
            <div className="pt-2">
              <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
                Support the Work
              </p>
              <a
                href="https://patreon.com/BlackMaleJournal"
                className="inline-block self-start border border-bmj-amber/40 bg-bmj-amber/10 px-5 py-2 font-label text-xs uppercase tracking-label text-bmj-cream no-underline transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-px hover:border-bmj-amber hover:bg-bmj-amber/20 hover:text-bmj-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Patreon — Join the Inner Circle
              </a>
            </div>

            {/* Direct support */}
            <div className="pt-2">
              <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
                Direct Support
              </p>
              <div className="flex flex-wrap gap-3">
                {DIRECT_SUPPORT_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2 — Navigation */}
          <nav aria-label="Footer navigation" className="surface-panel p-6">
            <h3 className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Navigate
            </h3>
            <ul className="flex flex-col gap-2">
              {FOOTER_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-bmj-cream/80 no-underline transition-colors hover:text-bmj-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3 — Connect */}
          <div className="surface-panel p-6">
            <h3 className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Connect
            </h3>

            {/* Social icons */}
            <div className="mb-6 flex gap-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="border border-bmj-tan/20 p-2 text-bmj-tan transition-[border-color,color,background-color] duration-200 hover:border-bmj-red/50 hover:bg-bmj-black/30 hover:text-bmj-cream"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={20} aria-hidden="true" />
                </a>
              ))}
            </div>

            {/* Newsletter signup */}
            <h4 className="mb-3 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Newsletter
            </h4>
            <NewsletterForm source="footer" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-bmj-tan/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-bmj-tan">
            © 2026 The Black Male Journal. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="font-mono text-xs text-bmj-tan no-underline transition-colors hover:text-bmj-cream"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-mono text-xs text-bmj-tan no-underline transition-colors hover:text-bmj-cream"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
