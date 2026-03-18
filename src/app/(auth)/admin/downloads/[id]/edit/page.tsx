import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDownloadById } from '@/lib/supabase/admin-queries';
import { DownloadForm } from '../../DownloadForm';
import { updateDownloadAction } from '../../actions';

export const metadata: Metadata = {
  title: 'Edit Download — Admin',
  robots: { index: false, follow: false },
};

interface EditDownloadPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDownloadPage({ params }: EditDownloadPageProps) {
  const { id } = await params;
  const download = await getDownloadById(id);

  if (!download) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl text-bmj-white">EDIT DOWNLOAD</h1>
      <p className="mb-8 font-mono text-xs text-bmj-tan">ID: {download.id}</p>
      <DownloadForm download={download} action={updateDownloadAction} />
    </div>
  );
}
