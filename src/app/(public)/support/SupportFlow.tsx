'use client';

import { useState } from 'react';

const PRESETS = [
  { amount: 5, label: '$5' },
  { amount: 15, label: '$15' },
  { amount: 25, label: '$25' },
  { amount: 50, label: '$50' },
];

const IMPACT_LABELS: Record<number, string> = {
  5: 'Covers hosting, domain, and infrastructure for one month',
  15: 'Funds one Weekend Briefing — research, writing, and publication',
  25: 'Supports a full week of articles, dispatches, and briefing production',
  50: 'Funds deep investigative reporting and original documentary research',
};

const BRAND_SYMBOLS = ['\u2605', '\u270A', '\u2726'];

type Frequency = 'monthly' | 'once';

export function SupportFlow() {
  const [selectedAmount, setSelectedAmount] = useState(15);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [coverFees, setCoverFees] = useState(false);
  const [note, setNote] = useState('');
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const activeAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  const feeAdjusted = coverFees
    ? Math.ceil(((activeAmount + 0.30) / (1 - 0.029)) * 100) / 100
    : activeAmount;
  const feeDiff = coverFees ? (feeAdjusted - activeAmount).toFixed(2) : '0.00';

  function handlePreset(amount: number) {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  }

  function handleCustomFocus() {
    setIsCustom(true);
  }

  function insertSymbol(symbol: string) {
    setNote((prev) => prev + symbol);
  }

  async function handleSubmit() {
    if (activeAmount < 1) {
      setErrorMsg('Please enter at least $1.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      if (subscribeNewsletter && newsletterEmail) {
        await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newsletterEmail, source: 'support-page' }),
        }).catch(() => {});
      }

      const res = await fetch('/api/stripe/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: activeAmount,
          frequency,
          coverFees,
          note: note.trim() || undefined,
          email: newsletterEmail || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.');
        setStatus('error');
        return;
      }

      window.location.href = data.url;
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Frequency toggle */}
      <div className="flex border border-bmj-tan/30">
        <button
          type="button"
          onClick={() => setFrequency('monthly')}
          className={`flex-1 py-3 font-label text-xs uppercase tracking-widest transition-colors ${
            frequency === 'monthly'
              ? 'bg-bmj-red text-bmj-white'
              : 'bg-bmj-black text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setFrequency('once')}
          className={`flex-1 py-3 font-label text-xs uppercase tracking-widest transition-colors ${
            frequency === 'once'
              ? 'bg-bmj-red text-bmj-white'
              : 'bg-bmj-black text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          One-time
        </button>
      </div>

      {/* Amount presets */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PRESETS.map(({ amount, label }) => (
          <button
            key={amount}
            type="button"
            onClick={() => handlePreset(amount)}
            className={`border py-4 font-display text-2xl uppercase transition-colors ${
              !isCustom && selectedAmount === amount
                ? 'border-bmj-red bg-bmj-red/10 text-bmj-white'
                : 'border-bmj-tan/30 bg-bmj-black text-bmj-cream hover:border-bmj-red/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div>
        <label
          htmlFor="custom-amount"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Custom Amount
        </label>
        <div className="flex items-center border border-bmj-tan/30 bg-bmj-black">
          <span className="pl-4 font-display text-lg text-bmj-tan">$</span>
          <input
            id="custom-amount"
            type="number"
            min="1"
            max="10000"
            step="1"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setIsCustom(true);
            }}
            onFocus={handleCustomFocus}
            placeholder="Other amount"
            className="w-full bg-transparent px-2 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Impact label */}
      {!isCustom && IMPACT_LABELS[selectedAmount] && (
        <p className="font-body text-sm italic text-bmj-amber">
          {frequency === 'monthly' ? `$${selectedAmount}/mo` : `$${selectedAmount}`}
          {' \u2014 '}
          {IMPACT_LABELS[selectedAmount]}
        </p>
      )}

      {/* Cover fees checkbox */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={coverFees}
          onChange={(e) => setCoverFees(e.target.checked)}
          className="mt-1 accent-bmj-red"
        />
        <span className="font-body text-sm text-bmj-cream/80">
          Cover processing fees
          {coverFees && activeAmount >= 1 && (
            <span className="text-bmj-tan"> (+${feeDiff})</span>
          )}
        </span>
      </label>

      {/* Note */}
      <div>
        <label
          htmlFor="donor-note"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Leave a Note <span className="text-bmj-tan/50">(optional)</span>
        </label>
        <div className="mb-1 flex gap-2">
          {BRAND_SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => insertSymbol(symbol)}
              className="border border-bmj-tan/20 px-2 py-1 text-sm transition-colors hover:border-bmj-red/40"
              aria-label={`Insert ${symbol}`}
            >
              {symbol}
            </button>
          ))}
        </div>
        <textarea
          id="donor-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="A message for the Chairman..."
          className="w-full resize-none border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
        />
      </div>

      {/* Newsletter checkbox + conditional email input */}
      <div className="space-y-2">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={subscribeNewsletter}
            onChange={(e) => setSubscribeNewsletter(e.target.checked)}
            className="mt-1 accent-bmj-red"
          />
          <span className="font-body text-sm text-bmj-cream/80">
            Subscribe to the newsletter
          </span>
        </label>
        {subscribeNewsletter && (
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-2 font-mono text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
          />
        )}
      </div>

      {/* Error message */}
      {status === 'error' && (
        <p className="font-mono text-xs text-bmj-red">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={status === 'loading' || activeAmount < 1}
        className="w-full bg-bmj-red py-4 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'loading'
          ? 'Redirecting to checkout...'
          : `Support BMJ \u2014 $${activeAmount >= 1 ? (coverFees ? feeAdjusted.toFixed(2) : activeAmount.toFixed(2)) : '0.00'}${frequency === 'monthly' ? '/mo' : ''}`}
      </button>

      <p className="text-center font-mono text-[10px] text-bmj-tan/50">
        Secure payment via Stripe. Apple Pay &amp; Google Pay accepted.
      </p>
    </div>
  );
}
