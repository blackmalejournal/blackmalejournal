import { ExternalLink } from 'lucide-react';

const METHODS = [
  {
    label: 'CashApp',
    handle: '$BlackMaleJournal',
    href: 'https://cash.app/$BlackMaleJournal',
    description: 'Tap to open CashApp',
  },
  {
    label: 'Venmo',
    handle: '@BlackMaleJournal',
    href: 'https://venmo.com/BlackMaleJournal',
    description: 'Tap to open Venmo',
  },
  {
    label: 'PayPal',
    handle: 'paypal.me/BlackMaleJournal',
    href: 'https://paypal.me/BlackMaleJournal',
    description: 'One-time or recurring',
  },
];

export function AlternativeMethods() {
  return (
    <div className="space-y-6">
      <h2 className="font-label text-xs uppercase tracking-widest text-bmj-tan">
        More Ways to Support
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {METHODS.map((method) => (
          <a
            key={method.label}
            href={method.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-bmj-tan/20 bg-bmj-brown px-4 py-3 transition-colors hover:border-bmj-red/40"
          >
            <div>
              <span className="block font-label text-xs uppercase tracking-widest text-bmj-cream">
                {method.label}
              </span>
              <span className="mt-0.5 block font-mono text-[11px] text-bmj-tan">
                {method.handle}
              </span>
            </div>
            <ExternalLink size={14} className="shrink-0 text-bmj-tan/50" />
          </a>
        ))}
      </div>

      <a
        href="https://patreon.com/BlackMaleJournal"
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-bmj-amber/30 bg-bmj-brown px-4 py-4 text-center transition-colors hover:border-bmj-amber/60"
      >
        <span className="block font-label text-sm uppercase tracking-widest text-bmj-amber">
          Join the Inner Circle on Patreon
        </span>
        <span className="mt-1 block font-body text-xs text-bmj-cream/60">
          Exclusive community access, early content, direct line to the Chairman
        </span>
      </a>
    </div>
  );
}
