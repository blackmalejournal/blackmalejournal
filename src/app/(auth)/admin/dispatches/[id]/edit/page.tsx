import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDispatchById } from '@/lib/supabase/admin-queries';
import { DispatchForm } from '../../DispatchForm';
import { updateDispatchAction } from '../../actions';

export const metadata: Metadata = {
  title: 'Edit Dispatch — Admin',
  robots: { index: false, follow: false },
};

interface EditDispatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDispatchPage({ params }: EditDispatchPageProps) {
  const { id } = await params;
  const dispatch = await getDispatchById(id);

  if (!dispatch) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl text-bmj-white">EDIT DISPATCH</h1>
      <p className="mb-8 font-mono text-xs text-bmj-tan">ID: {dispatch.id}</p>
      <DispatchForm dispatch={dispatch} action={updateDispatchAction} />
    </div>
  );
}
