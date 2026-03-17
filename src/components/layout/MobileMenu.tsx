'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
import { signOut } from '@/app/(auth)/actions';
import type { NavUser } from './Navbar';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: NavUser;
}

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academy', href: '/academy' },
  { label: 'Handbooks', href: '/handbooks' },
  { label: 'Resources', href: '/resources' },
  { label: 'Video', href: '/video' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

const SOCIAL_LINKS = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter / X' },
];

export function MobileMenu({ isOpen, onClose, user = null }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.nav
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-bmj-black px-8 py-6"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="mb-10 self-end text-bmj-cream transition-opacity hover:opacity-70"
            >
              <X size={28} aria-hidden="true" />
            </button>

            {/* Nav links */}
            <ul className="flex flex-1 flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="font-display text-5xl uppercase tracking-wide text-bmj-white transition-colors hover:text-bmj-red"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user && (
                <li>
                  <Link
                    href="/portal"
                    onClick={onClose}
                    className="font-display text-5xl uppercase tracking-wide text-bmj-amber transition-colors hover:text-bmj-red"
                  >
                    Portal
                  </Link>
                </li>
              )}
            </ul>

            {/* Auth CTA */}
            {user ? (
              <form action={signOut} className="mb-8">
                <button
                  type="submit"
                  className="block w-full border border-bmj-red py-3 text-center font-label text-sm uppercase tracking-widest text-bmj-red transition-colors hover:bg-bmj-red hover:text-bmj-white"
                >
                  Log Out
                </button>
              </form>
            ) : (
              <div className="mb-8 flex flex-col gap-3">
                <Link
                  href="/signup"
                  onClick={onClose}
                  className="block bg-bmj-red py-3 text-center font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
                >
                  Join
                </Link>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block border border-bmj-tan/30 py-3 text-center font-label text-sm uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
                >
                  Log In
                </Link>
              </div>
            )}

            {/* Socials */}
            <div className="flex gap-6 pb-4">
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
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
