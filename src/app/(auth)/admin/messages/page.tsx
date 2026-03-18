import type { Metadata } from 'next';
import { getAllContactSubmissions } from '@/lib/supabase/admin-queries';

export const metadata: Metadata = {
  title: 'Messages — Admin',
  robots: { index: false, follow: false },
};

// ── Date formatter ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function MessagesAdminPage() {
  const submissions = await getAllContactSubmissions();

  return (
    <div>
      {/* Page header */}
      <div>
        <h1 className="font-display text-3xl tracking-widest text-bmj-white">
          MESSAGES
        </h1>
        <p className="mt-1 font-mono text-sm text-bmj-tan">
          {submissions.length} {submissions.length === 1 ? 'message' : 'messages'}
        </p>
      </div>

      {/* Message list */}
      <div className="mt-6">
        {submissions.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No messages yet.
          </p>
        ) : (
          <ul>
            {submissions.map((submission) => (
              <li
                key={submission.id}
                className="border-b border-bmj-tan/10 py-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Name + email row */}
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="font-display text-sm tracking-widest text-bmj-white">
                        {submission.name}
                      </span>
                      <span className="font-mono text-xs text-bmj-tan">
                        {submission.email}
                      </span>
                    </div>
                    {/* Subject */}
                    {submission.subject && (
                      <p className="mt-1 font-label text-xs uppercase tracking-widest text-bmj-cream/80">
                        {submission.subject}
                      </p>
                    )}
                    {/* Message preview */}
                    <p className="mt-2 font-body text-sm text-bmj-cream/70">
                      {submission.message.length > 100
                        ? submission.message.slice(0, 100) + '…'
                        : submission.message}
                    </p>
                  </div>
                  {/* Date */}
                  <span className="shrink-0 font-mono text-xs text-bmj-tan">
                    {formatDate(submission.submitted_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
