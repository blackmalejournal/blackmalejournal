import { render, screen } from '@testing-library/react';
import type { Briefing } from '@/lib/supabase/types';

const mockBriefings: Briefing[] = [
  {
    id: 'br-1',
    issue_number: 3,
    title: 'Weekend Briefing 003',
    slug: 'weekend-briefing-003',
    sections: [
      { title: 'Opening', body: 'Welcome to issue 3.' },
      { title: 'Politics', body: 'Political analysis here.' },
    ],
    access_tier: 'free',
    status: 'published',
    cover_image: null,
    published_at: '2026-03-15T00:00:00Z',
    created_at: '2026-03-14T00:00:00Z',
  },
  {
    id: 'br-2',
    issue_number: 2,
    title: 'Weekend Briefing 002',
    slug: 'weekend-briefing-002',
    sections: [{ title: 'Health', body: 'Health content.' }],
    access_tier: 'premium',
    status: 'draft',
    cover_image: null,
    published_at: '2026-03-10T00:00:00Z',
    created_at: '2026-03-09T00:00:00Z',
  },
];

jest.mock('@/lib/supabase/admin-queries', () => ({
  getAllBriefings: jest.fn().mockResolvedValue(mockBriefings),
}));

describe('BriefingsAdminPage', () => {
  async function renderPage(status?: string) {
    const { default: BriefingsAdminPage } = await import(
      '@/app/(auth)/admin/briefings/page'
    );
    const searchParams = Promise.resolve(status ? { status } : {});
    render(await BriefingsAdminPage({ searchParams }));
  }

  it('renders "BRIEFINGS" heading', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'BRIEFINGS' }),
    ).toBeInTheDocument();
  });

  it('renders briefing titles', async () => {
    await renderPage();
    expect(screen.getByText('Weekend Briefing 003')).toBeInTheDocument();
    expect(screen.getByText('Weekend Briefing 002')).toBeInTheDocument();
  });

  it('renders status badges', async () => {
    await renderPage();
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('renders "New Briefing" link', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: /new briefing/i });
    expect(link).toHaveAttribute('href', '/admin/briefings/new');
  });

  it('renders briefing count', async () => {
    await renderPage();
    expect(screen.getByText('2 briefings')).toBeInTheDocument();
  });

  it('renders Edit links pointing to briefing edit pages', async () => {
    await renderPage();
    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute('href', '/admin/briefings/br-1/edit');
    expect(editLinks[1]).toHaveAttribute('href', '/admin/briefings/br-2/edit');
  });

  it('renders issue number in metadata', async () => {
    await renderPage();
    expect(screen.getByText(/^#3/)).toBeInTheDocument();
    expect(screen.getByText(/^#2/)).toBeInTheDocument();
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
});

describe('BriefingsAdminPage — empty state', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders empty state when no briefings', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getAllBriefings: jest.fn().mockResolvedValue([]),
    }));

    const { default: BriefingsAdminPage } = await import(
      '@/app/(auth)/admin/briefings/page'
    );
    const searchParams = Promise.resolve({});
    render(await BriefingsAdminPage({ searchParams }));

    expect(
      screen.getByText('No briefings found. Create your first briefing.'),
    ).toBeInTheDocument();
  });
});
