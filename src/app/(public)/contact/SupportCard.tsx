import Link from 'next/link';
import { Heart } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { SUPPORT_PAYMENT_METHODS } from '@/lib/seo';

const QUICK_SUPPORT_METHODS = SUPPORT_PAYMENT_METHODS.slice(0, 2);

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
        href={PATHS.SUPPORT}
        className="mb-4 block bg-bmj-red py-3 text-center font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
      >
        Fund the Mission
      </Link>

      <div className="flex justify-between text-center">
        {QUICK_SUPPORT_METHODS.map((method) => (
          <div key={method.label}>
            <span className="block font-label text-micro uppercase tracking-widest text-bmj-cream/80">
              {method.label}
            </span>
            <span className="font-mono text-xs text-bmj-cream">
              {method.handle}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
