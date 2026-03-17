import Link from 'next/link';
import { Download, Lock, FileText } from 'lucide-react';
import { getDownloadCategoryLabel, formatFileSize } from '@/lib/utils';
import type { AccessTier } from '@/lib/supabase/types';

interface DownloadCardProps {
  title: string;
  slug: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: number;
  accessTier: AccessTier;
  hasAccess: boolean;
  fileUrl: string;
}

export function DownloadCard({
  title,
  description,
  category,
  fileType,
  fileSize,
  accessTier,
  hasAccess,
  fileUrl,
}: DownloadCardProps) {
  return (
    <article className="flex items-start gap-4 border border-bmj-tan/20 bg-bmj-brown p-6 transition-colors hover:border-bmj-tan/40">
      {/* File icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-bmj-black">
        <FileText size={24} className="text-bmj-cream/30" aria-hidden="true" />
      </div>

      <div className="flex-1">
        <div className="mb-1 flex items-center gap-3">
          <span className="font-label text-xs uppercase tracking-widest text-bmj-tan">
            {getDownloadCategoryLabel(category)}
          </span>
          <span className="font-mono text-xs text-bmj-tan/50">
            <span>{fileType.toUpperCase()}</span>
            <span aria-hidden="true"> · </span>
            <span>{formatFileSize(fileSize)}</span>
          </span>
        </div>

        <h3 className="mb-1 font-display text-lg text-bmj-white">
          {title}
        </h3>

        <p className="line-clamp-2 font-body text-sm text-bmj-cream/70">
          {description}
        </p>
      </div>

      {/* Action */}
      <div className="shrink-0 self-center">
        {hasAccess ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-bmj-red px-4 py-2 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            <Download size={14} />
            Download
          </a>
        ) : (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 border border-bmj-red/40 px-4 py-2 font-label text-xs uppercase tracking-widest text-bmj-red no-underline transition-colors hover:bg-bmj-red/10"
          >
            <Lock size={14} />
            Upgrade
          </Link>
        )}
      </div>
    </article>
  );
}
