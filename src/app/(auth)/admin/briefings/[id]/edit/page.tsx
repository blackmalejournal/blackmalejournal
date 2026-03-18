import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBriefingById } from '@/lib/supabase/admin-queries';
import { BriefingForm } from '../../BriefingForm';
import { updateBriefingAction } from '../../actions';

export const metadata: Metadata = {
  title: 'Edit Briefing — Admin',
  robots: { index: false, follow: false },
};

interface EditBriefingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBriefingPage({ params }: EditBriefingPageProps) {
  const { id } = await params;
  const briefing = await getBriefingById(id);

  if (!briefing) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl text-bmj-white">EDIT BRIEFING</h1>
      <p className="mb-8 font-mono text-xs text-bmj-tan">ID: {briefing.id}</p>
      <BriefingForm briefing={briefing} action={updateBriefingAction} />
    </div>
  );
}
