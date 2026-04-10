'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/** Enter-only fade via Tailwind keyframes — avoids Framer on the root layout shell. */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-fade-in motion-reduce:animate-none">
      {children}
    </div>
  );
}
