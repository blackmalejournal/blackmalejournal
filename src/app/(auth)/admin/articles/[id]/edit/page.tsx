import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleById } from '@/lib/supabase/admin-queries';
import { ArticleForm } from '../../ArticleForm';
import { updateArticleAction } from '../../actions';

export const metadata: Metadata = {
  title: 'Edit Article — Admin',
  robots: { index: false, follow: false },
};

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl text-bmj-white">EDIT ARTICLE</h1>
      <p className="mb-8 font-mono text-xs text-bmj-tan">ID: {article.id}</p>
      <ArticleForm article={article} action={updateArticleAction} />
    </div>
  );
}
