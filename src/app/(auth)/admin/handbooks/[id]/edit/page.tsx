import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getHandbookById } from '@/lib/supabase/admin-queries';
import { HandbookForm } from '../../HandbookForm';
import { updateHandbookAction } from '../../actions';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteHandbookAction } from '../../delete-action';

export const metadata: Metadata = {
  title: 'Edit Handbook — Admin',
  robots: { index: false, follow: false },
};

interface EditHandbookPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHandbookPage({ params }: EditHandbookPageProps) {
  const { id } = await params;
  const handbook = await getHandbookById(id);

  if (!handbook) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl text-bmj-white">EDIT HANDBOOK</h1>
      <p className="mb-8 font-mono text-xs text-bmj-tan">ID: {handbook.id}</p>
      <HandbookForm handbook={handbook} action={updateHandbookAction} />
      <div className="mt-8">
        <DeleteButton
          action={deleteHandbookAction.bind(null, handbook.id)}
          itemName="handbook"
        />
      </div>
    </div>
  );
}
