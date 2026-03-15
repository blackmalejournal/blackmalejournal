// src/components/layout/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "About",     href: "/about" },
  { label: "Academy",   href: "/academy" },
  { label: "Resources", href: "/resources" },
  { label: "Video",     href: "/video" },
  { label: "Blog",      href: "/blog" },
  { label: "Contact",   href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`accent-border-bottom sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? "bg-bmj-black/95 backdrop-blur-sm"
            : "bg-bmj-black"
        }`}
      >
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">

          {/* Logo / Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-3 no-underline"
            aria-label="The Black Male Journal — Home"
          >
            {/* Star mark (placeholder until Chairman provides SVG assets) */}
            <svg
              width="32"
              height="32"
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
            <span className="font-display text-xl tracking-wider text-bmj-white">
              The Black Male Journal
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`font-label text-xs uppercase tracking-widest transition-colors no-underline ${
                        isActive
                          ? "border-b-2 border-bmj-red text-bmj-white pb-0.5"
                          : "text-bmj-cream hover:text-bmj-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right side — JOIN + hamburger */}
          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="hidden bg-bmj-red px-5 py-2 font-label text-xs uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90 sm:block"
            >
              Join
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="text-bmj-cream transition-opacity hover:opacity-70 lg:hidden"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
