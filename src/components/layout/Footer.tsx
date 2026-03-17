// src/components/layout/Footer.tsx
import Link from "next/link";
import { NewsletterForm } from './NewsletterForm';
import { Instagram, Youtube, Linkedin, Twitter } from "lucide-react";

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "About",     href: "/about" },
  { label: "Academy",   href: "/academy" },
  { label: "Handbooks", href: "/handbooks" },
  { label: "Downloads", href: "/downloads" },
  { label: "Resources", href: "/resources" },
  { label: "Video",     href: "/video" },
  { label: "Blog",      href: "/blog" },
  { label: "Contact",   href: "/contact" },
];

const SOCIAL_LINKS = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube,   href: "#", label: "YouTube" },
  { icon: Linkedin,  href: "#", label: "LinkedIn" },
  { icon: Twitter,   href: "#", label: "Twitter / X" },
];

const SUPPORT_LINKS = [
  { label: "Patreon",  href: "#" },
  { label: "PayPal",   href: "#" },
  { label: "CashApp",  href: "#" },
  { label: "Venmo",    href: "#" },
];

export function Footer() {
  return (
    <footer className="accent-border-top bg-bmj-brown">
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M16 0L19.6 11.6H32L21.8 18.4L25.4 30L16 23.2L6.6 30L10.2 18.4L0 11.6H12.4L16 0Z"
                  fill="var(--bmj-red)"
                />
              </svg>
              <span className="font-display text-lg tracking-wider text-bmj-white">
                The Black Male Journal
              </span>
            </div>
            <p className="font-body text-sm leading-relaxed text-bmj-cream/70">
              Independent media house. Revolutionary masculinist platform covering
              health, philosophy, and politics for Black men.
            </p>

            {/* Support links */}
            <div className="flex flex-wrap gap-3 pt-2">
              {SUPPORT_LINKS.map((link) => (
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

          {/* Column 2 — Navigation */}
          <nav aria-label="Footer navigation">
            <h3 className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Navigate
            </h3>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
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
          <div>
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
                  className="text-bmj-tan transition-colors hover:text-bmj-cream"
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
        <div className="mt-10 border-t border-bmj-tan/20 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
