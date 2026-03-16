import { Heart } from 'lucide-react';

const SUPPORT_PLATFORMS = [
  { label: 'Patreon', href: '#', description: 'Monthly support' },
  { label: 'PayPal', href: '#', description: 'One-time or recurring' },
  { label: 'CashApp', href: '#', description: '$BlackMaleJournal' },
  { label: 'Venmo', href: '#', description: '@BlackMaleJournal' },
];

export function SupportCard() {
  return (
    <div className="border border-bmj-red/20 bg-bmj-brown p-6">
      <div className="mb-4 flex items-center gap-2">
        <Heart size={18} className="text-bmj-red" />
        <h3 className="font-label text-sm uppercase tracking-widest text-bmj-cream">
          Support the Mission
        </h3>
      </div>
      <p className="mb-5 font-body text-sm leading-relaxed text-bmj-cream/70">
        The Black Male Journal runs on community support. Every contribution
        fuels independent media for Black men.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {SUPPORT_PLATFORMS.map((platform) => (
          <a
            key={platform.label}
            href={platform.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-bmj-tan/20 bg-bmj-black px-4 py-3 text-center transition-colors hover:border-bmj-red/40"
          >
            <span className="block font-label text-xs uppercase tracking-widest text-bmj-cream">
              {platform.label}
            </span>
            <span className="mt-1 block font-mono text-[10px] text-bmj-tan/60">
              {platform.description}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
