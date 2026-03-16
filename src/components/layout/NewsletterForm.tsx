'use client';

import { useState } from 'react';

interface NewsletterFormProps {
  source?: string;
}

export function NewsletterForm({ source = 'footer' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setEmail('');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="font-body text-sm text-bmj-cream">
        You&apos;re in. Watch your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2"
      aria-label="Newsletter signup"
    >
      <label htmlFor={`newsletter-email-${source}`} className="sr-only">
        Email address
      </label>
      <input
        id={`newsletter-email-${source}`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === 'loading'}
        className="border border-bmj-tan/30 bg-bmj-black px-4 py-2 font-mono text-sm text-bmj-cream placeholder-bmj-tan/50 outline-none focus:border-bmj-red disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-bmj-red px-4 py-2 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status === 'error' && (
        <p className="font-mono text-xs text-bmj-red">{errorMsg}</p>
      )}
    </form>
  );
}
