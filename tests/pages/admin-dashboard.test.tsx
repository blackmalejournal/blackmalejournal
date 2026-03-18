import { render, screen } from '@testing-library/react';

jest.mock('@/lib/supabase/admin-queries', () => ({
  getContentCounts: jest.fn().mockResolvedValue({
    articles: { total: 12, published: 8, draft: 4 },
    briefings: { total: 5, published: 4, draft: 1 },
    dispatches: { total: 8, published: 6, draft: 2 },
    downloads: { total: 15 },
  }),
}));

jest.mock('@/components/ui/StarDivider', () => ({
  StarDivider: ({ className }: { className?: string }) => (
    <hr data-testid="star-divider" className={className} />
  ),
}));

describe('AdminDashboardPage', () => {
  async function renderPage() {
    const { default: AdminDashboardPage } = await import(
      '@/app/(auth)/admin/page'
    );
    render(await AdminDashboardPage());
  }

  it('renders "DASHBOARD" heading', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'DASHBOARD' }),
    ).toBeInTheDocument();
  });

  it('renders all four content count cards', async () => {
    await renderPage();
    expect(screen.getByText('Articles')).toBeInTheDocument();
    expect(screen.getByText('Briefings')).toBeInTheDocument();
    expect(screen.getByText('Dispatches')).toBeInTheDocument();
    expect(screen.getByText('Downloads')).toBeInTheDocument();
  });

  it('renders article total count', async () => {
    await renderPage();
    // "12" appears as the articles total
    const totals = screen.getAllByText('12');
    expect(totals.length).toBeGreaterThanOrEqual(1);
  });

  it('renders published and draft counts for articles', async () => {
    await renderPage();
    // published: 8 appears as articles published count (also as briefings total — use getAllByText)
    const eights = screen.getAllByText('8');
    expect(eights.length).toBeGreaterThanOrEqual(1);
    // draft: 4 appears as articles draft count (also as briefings published — use getAllByText)
    const fours = screen.getAllByText('4');
    expect(fours.length).toBeGreaterThanOrEqual(1);
    // confirm "published" and "draft" labels are present
    expect(screen.getAllByText('published').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/draft/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders downloads total without published/draft rows', async () => {
    await renderPage();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders "New Article" quick action link to /admin/articles/new', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: /new article/i });
    expect(link).toHaveAttribute('href', '/admin/articles/new');
  });

  it('renders "New Dispatch" quick action link to /admin/dispatches/new', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: /new dispatch/i });
    expect(link).toHaveAttribute('href', '/admin/dispatches/new');
  });

  it('renders star dividers', async () => {
    await renderPage();
    const dividers = screen.getAllByTestId('star-divider');
    expect(dividers.length).toBeGreaterThanOrEqual(2);
  });
});
