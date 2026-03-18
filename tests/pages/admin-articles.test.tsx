import { render, screen } from '@testing-library/react';
import type { Article } from '@/lib/supabase/types';

const mockArticles: Article[] = [
  {
    id: 'art-1',
    title: 'The Discipline of Stillness',
    slug: 'the-discipline-of-stillness',
    lens: 'philosophy',
    tags: ['mindset', 'discipline'],
    excerpt: 'On the power of silence.',
    body: 'Full body text.',
    featured: true,
    access_tier: 'free',
    status: 'published',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-03-10T00:00:00Z',
    created_at: '2026-03-08T00:00:00Z',
  },
  {
    id: 'art-2',
    title: 'Building Community Power',
    slug: 'building-community-power',
    lens: 'politics',
    tags: ['organizing'],
    excerpt: 'Grassroots strategy.',
    body: 'Full body text.',
    featured: false,
    access_tier: 'premium',
    status: 'draft',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-03-12T00:00:00Z',
    created_at: '2026-03-11T00:00:00Z',
  },
];

jest.mock('@/lib/supabase/admin-queries', () => ({
  getAllArticles: jest.fn().mockResolvedValue(mockArticles),
}));

describe('ArticlesAdminPage', () => {
  async function renderPage(status?: string) {
    const { default: ArticlesAdminPage } = await import(
      '@/app/(auth)/admin/articles/page'
    );
    const searchParams = Promise.resolve(status ? { status } : {});
    render(await ArticlesAdminPage({ searchParams }));
  }

  it('renders "ARTICLES" heading', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'ARTICLES' }),
    ).toBeInTheDocument();
  });

  it('renders article titles', async () => {
    await renderPage();
    expect(
      screen.getByText('The Discipline of Stillness'),
    ).toBeInTheDocument();
    expect(screen.getByText('Building Community Power')).toBeInTheDocument();
  });

  it('renders status badges', async () => {
    await renderPage();
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('renders "New Article" link', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: /new article/i });
    expect(link).toHaveAttribute('href', '/admin/articles/new');
  });

  it('renders article count', async () => {
    await renderPage();
    expect(screen.getByText('2 articles')).toBeInTheDocument();
  });

  it('renders Edit links pointing to article edit pages', async () => {
    await renderPage();
    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute('href', '/admin/articles/art-1/edit');
    expect(editLinks[1]).toHaveAttribute('href', '/admin/articles/art-2/edit');
  });

  it('renders star icon for featured articles', async () => {
    await renderPage();
    const star = screen.getByLabelText('Featured');
    expect(star).toBeInTheDocument();
  });

  it('renders status filter tabs', async () => {
    await renderPage();
    const nav = screen.getByRole('navigation', { name: /status filter/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('renders metadata with lens, tier, and date', async () => {
    await renderPage();
    // First article metadata
    expect(screen.getByText(/philosophy/)).toBeInTheDocument();
    expect(screen.getByText(/politics/)).toBeInTheDocument();
  });
});

describe('ArticlesAdminPage — empty state', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders empty state when no articles', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getAllArticles: jest.fn().mockResolvedValue([]),
    }));

    const { default: ArticlesAdminPage } = await import(
      '@/app/(auth)/admin/articles/page'
    );
    const searchParams = Promise.resolve({});
    render(await ArticlesAdminPage({ searchParams }));

    expect(
      screen.getByText('No articles found. Create your first article.'),
    ).toBeInTheDocument();
  });
});
