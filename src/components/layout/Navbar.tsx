'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { UserDropdown } from './UserDropdown';
import { SearchDialog } from '@/components/ui/SearchDialog';

export type NavUser = {
  email: string;
  displayName?: string;
} | null;

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academy', href: '/academy' },
  { label: 'Handbooks', href: '/handbooks' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'Resources', href: '/resources' },
  { label: 'Video', href: '/video' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

interface NavbarProps {
  user?: NavUser;
}

export function Navbar({ user = null }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`accent-border-bottom sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-bmj-black/95 backdrop-blur-sm'
            : 'bg-bmj-black'
        }`}
      >
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
          {/* Logo / Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-3 no-underline"
            aria-label="The Black Male Journal — Home"
          >
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
                          ? 'border-b-2 border-bmj-red text-bmj-white pb-0.5'
                          : 'text-bmj-cream hover:text-bmj-white'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right side — auth-aware */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search (Ctrl+K)"
              className="hidden text-bmj-cream transition-opacity hover:opacity-70 lg:block"
            >
              <Search size={18} aria-hidden="true" />
            </button>
            {user ? (
              <div className="hidden sm:block">
                <UserDropdown
                  email={user.email}
                  displayName={user.displayName}
                />
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden font-label text-xs uppercase tracking-widest text-bmj-cream no-underline transition-colors hover:text-bmj-white sm:block"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="hidden bg-bmj-red px-5 py-2 font-label text-xs uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90 sm:block"
                >
                  Join
                </Link>
              </>
            )}

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

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
      />
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
