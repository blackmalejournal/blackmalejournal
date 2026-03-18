'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from '@/app/(auth)/actions';

interface UserDropdownProps {
  email: string;
  displayName?: string;
}

export function UserDropdown({ email, displayName }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initial = (displayName?.[0] || email[0] || '?').toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex h-9 w-9 items-center justify-center bg-bmj-red font-label text-sm text-bmj-white transition-opacity hover:opacity-90"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 border border-bmj-tan/40 bg-bmj-brown">
          <div className="border-b border-bmj-tan/20 px-4 py-3">
            <p className="truncate font-label text-xs uppercase tracking-widest text-bmj-tan">
              {displayName || email}
            </p>
          </div>

          <nav className="py-1">
            <Link
              href="/portal"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 font-body text-sm text-bmj-cream no-underline transition-colors hover:bg-bmj-black/50 hover:text-bmj-white"
            >
              Portal
            </Link>
            <Link
              href="/portal/settings"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 font-body text-sm text-bmj-cream no-underline transition-colors hover:bg-bmj-black/50 hover:text-bmj-white"
            >
              Settings
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full px-4 py-2 text-left font-body text-sm text-bmj-red transition-colors hover:bg-bmj-black/50"
              >
                Log Out
              </button>
            </form>
          </nav>
        </div>
      )}
    </div>
  );
}
