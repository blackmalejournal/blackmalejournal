'use client';

import Link from 'next/link';
import { signup } from '../actions';

interface SignupFormProps {
  preselectedTier?: string;
}

export function SignupForm({ preselectedTier }: SignupFormProps) {
  return (
    <div className="border border-bmj-red/20 bg-bmj-brown p-8">
      <form action={signup} className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
          >
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
            placeholder="Your name"
          />
        </div>

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
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
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
            minLength={6}
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        {preselectedTier && preselectedTier !== 'free' && (
          <div className="border border-bmj-amber/30 bg-bmj-amber/10 p-3">
            <p className="font-label text-xs uppercase tracking-widest text-bmj-amber">
              Selected: {preselectedTier} plan
            </p>
            <p className="mt-1 font-body text-xs text-bmj-tan">
              You&apos;ll be directed to payment after signup.
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-bmj-tan">
        Already a member?{' '}
        <Link href="/login" className="text-bmj-red hover:text-bmj-cream">
          Log in &rarr;
        </Link>
      </p>
    </div>
  );
}
