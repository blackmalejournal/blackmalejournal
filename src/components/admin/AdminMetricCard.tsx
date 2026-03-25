import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

type AdminMetricTone = 'default' | 'warning' | 'critical' | 'success';

const toneClasses: Record<AdminMetricTone, string> = {
  default: 'border-bmj-tan/20 text-bmj-tan',
  warning: 'border-bmj-amber/30 text-bmj-amber',
  critical: 'border-bmj-red/30 text-bmj-red',
  success: 'border-[#416100]/30 text-[#416100]',
};

interface AdminMetricCardProps {
  label: string;
  value: ReactNode;
  helper?: string;
  href?: string;
  tone?: AdminMetricTone;
}

export function AdminMetricCard({
  label,
  value,
  helper,
  href,
  tone = 'default',
}: AdminMetricCardProps) {
  const content = (
    <div
      className={`h-full border bg-bmj-brown p-4 ${toneClasses[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-label text-micro uppercase tracking-widest">
            {label}
          </p>
          <p className="mt-2 font-mono text-2xl text-bmj-white">{value}</p>
          {helper ? (
            <p className="mt-2 font-body text-sm text-bmj-cream/70">{helper}</p>
          ) : null}
        </div>
        {href ? (
          <ArrowUpRight
            size={16}
            aria-hidden="true"
            className="mt-1 shrink-0 text-bmj-cream/70"
          />
        ) : null}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block h-full transition-colors hover:text-bmj-white">
      {content}
    </Link>
  );
}
