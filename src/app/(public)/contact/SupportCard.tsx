import Link from 'next/link';
import { Heart } from 'lucide-react';

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

      <Link
        href="/support"
        className="mb-4 block bg-bmj-red py-3 text-center font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
      >
        Fund the Mission
      </Link>

      <div className="flex justify-between text-center">
        <div>
          <span className="block font-label text-[10px] uppercase tracking-widest text-bmj-cream/80">
            CashApp
          </span>
          <span className="font-mono text-xs text-bmj-cream">
            $BlackMaleJournal
          </span>
        </div>
        <div>
          <span className="block font-label text-[10px] uppercase tracking-widest text-bmj-cream/80">
            Venmo
          </span>
          <span className="font-mono text-xs text-bmj-cream">
            @BlackMaleJournal
          </span>
        </div>
      </div>
    </div>
  );
}
