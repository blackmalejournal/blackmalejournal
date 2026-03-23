'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login, signInWithMagicLink } from '../actions';
import { withQuery } from '@/lib/paths';

interface LoginFormProps {
  nextHref?: string;
}

export function LoginForm({ nextHref }: LoginFormProps) {
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  return (
    <div className="border border-bmj-red/20 bg-bmj-brown p-8">
      {/* Mode toggle */}
      <div className="mb-6 flex gap-4 border-b border-bmj-tan/20 pb-4">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`font-label text-xs uppercase tracking-widest transition-colors ${
            mode === 'password'
              ? 'text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`font-label text-xs uppercase tracking-widest transition-colors ${
            mode === 'magic'
              ? 'text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Magic Link
        </button>
      </div>

      {mode === 'password' ? (
        <form action={login} className="space-y-4">
          {nextHref && <input type="hidden" name="next" value={nextHref} />}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Log In
          </button>
        </form>
      ) : (
        <form action={signInWithMagicLink} className="space-y-4">
          {nextHref && <input type="hidden" name="next" value={nextHref} />}
          <div>
            <label
              htmlFor="magic-email"
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              Email
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Send Magic Link
          </button>
        </form>
      )}

      <p className="mt-6 text-center font-body text-sm text-bmj-tan">
        Don&apos;t have an account?{' '}
        <Link
          href={withQuery('/signup', { next: nextHref })}
          className="text-bmj-red hover:text-bmj-cream"
        >
          Join the movement &rarr;
        </Link>
      </p>
    </div>
  );
}
