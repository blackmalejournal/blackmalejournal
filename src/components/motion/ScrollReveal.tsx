'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Direction of the slide: 'up' (default), 'left', 'right', 'none' (fade only) */
  direction?: 'up' | 'left' | 'right' | 'none';
  /** Delay in seconds before animation starts */
  delay?: number;
  /** Duration in seconds */
  duration?: number;
  /** Render as a different element (default: div) */
  as?: 'div' | 'section' | 'article' | 'aside';
  /** How much of the element must be visible to trigger (0-1) */
  threshold?: number;
}

const offsets = {
  up: { y: 40 },
  left: { x: -40 },
  right: { x: 40 },
  none: {},
} as const;

export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  as = 'div',
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const prefersReducedMotion = useReducedMotion();

  const MotionTag = motion[as] as typeof motion.div;

  const hidden = { opacity: 0, ...offsets[direction] };
  const visible = {
    opacity: 1,
    ...Object.fromEntries(Object.keys(offsets[direction]).map((k) => [k, 0])),
  };

  if (prefersReducedMotion) {
    return (
      <MotionTag ref={ref} className={className} initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={hidden}
      animate={isInView ? visible : hidden}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </MotionTag>
  );
}
