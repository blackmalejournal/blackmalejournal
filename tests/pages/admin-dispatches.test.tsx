import { render, screen } from '@testing-library/react';
import type { Dispatch } from '@/lib/supabase/types';

const mockDispatches: Dispatch[] = [
  {
    id: 'dsp-1',
    title: 'The State of Black Fatherhood',
    slug: 'the-state-of-black-fatherhood',
    lens: 'philosophy',
    excerpt: 'Examining fatherhood through a revolutionary lens.',
    body: 'Full body text.',
    status: 'published',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-03-10T00:00:00Z',
    created_at: '2026-03-08T00:00:00Z',
  },
  {
    id: 'dsp-2',
    title: 'Community Wellness Initiative',
    slug: 'community-wellness-initiative',
    lens: 'health',
    excerpt: 'Building wellness infrastructure.',
    body: 'Full body text.',
    status: 'draft',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-03-12T00:00:00Z',
    created_at: '2026-03-11T00:00:00Z',
  },
];

jest.mock('@/lib/supabase/admin-queries', () => ({
  getAllDispatches: jest.fn().mockResolvedValue(mockDispatches),
}));

describe('DispatchesAdminPage', () => {
  async function renderPage(status?: string) {
    const { default: DispatchesAdminPage } = await import(
      '@/app/(auth)/admin/dispatches/page'
    );
    const searchParams = Promise.resolve(status ? { status } : {});
    render(await DispatchesAdminPage({ searchParams }));
  }

  it('renders "DISPATCHES" heading', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'DISPATCHES' }),
    ).toBeInTheDocument();
  });

  it('renders dispatch titles', async () => {
    await renderPage();
    expect(
      screen.getByText('The State of Black Fatherhood'),
    ).toBeInTheDocument();
    expect(screen.getByText('Community Wellness Initiative')).toBeInTheDocument();
  });

  it('renders status badges', async () => {
    await renderPage();
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('renders "New Dispatch" link', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: /new dispatch/i });
    expect(link).toHaveAttribute('href', '/admin/dispatches/new');
  });

  it('renders dispatch count', async () => {
    await renderPage();
    expect(screen.getByText('2 dispatches')).toBeInTheDocument();
  });

  it('renders Edit links pointing to dispatch edit pages', async () => {
    await renderPage();
    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute('href', '/admin/dispatches/dsp-1/edit');
    expect(editLinks[1]).toHaveAttribute('href', '/admin/dispatches/dsp-2/edit');
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

  it('renders metadata with lens and date', async () => {
    await renderPage();
    expect(screen.getByText(/Philosophy/)).toBeInTheDocument();
    expect(screen.getByText(/Health/)).toBeInTheDocument();
  });
});

describe('DispatchesAdminPage — empty state', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders empty state when no dispatches', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getAllDispatches: jest.fn().mockResolvedValue([]),
    }));

    const { default: DispatchesAdminPage } = await import(
      '@/app/(auth)/admin/dispatches/page'
    );
    const searchParams = Promise.resolve({});
    render(await DispatchesAdminPage({ searchParams }));

    expect(
      screen.getByText('No dispatches found. Create your first dispatch.'),
    ).toBeInTheDocument();
  });
});
