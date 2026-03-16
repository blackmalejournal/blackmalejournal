import { render, screen, fireEvent } from '@testing-library/react';
import { TagFilterRow } from '@/components/content/TagFilterRow';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/articles',
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  mockPush.mockClear();
});

describe('TagFilterRow', () => {
  it('returns null for empty tags array', () => {
    const { container } = render(<TagFilterRow tags={[]} activeTag={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all tags', () => {
    render(<TagFilterRow tags={['fitness', 'mindset', 'policy']} activeTag={null} />);
    expect(screen.getByText('fitness')).toBeInTheDocument();
    expect(screen.getByText('mindset')).toBeInTheDocument();
    expect(screen.getByText('policy')).toBeInTheDocument();
  });

  it('active tag has different styling', () => {
    render(<TagFilterRow tags={['fitness', 'mindset']} activeTag="fitness" />);
    const activeBtn = screen.getByText('fitness');
    const inactiveBtn = screen.getByText('mindset');
    expect(activeBtn.className).toContain('bg-bmj-red');
    expect(inactiveBtn.className).toContain('bg-bmj-brown');
  });

  it('clicking active tag removes tag param', () => {
    jest.spyOn(require('next/navigation'), 'useSearchParams').mockReturnValue(
      new URLSearchParams('tag=fitness'),
    );
    render(<TagFilterRow tags={['fitness', 'mindset']} activeTag="fitness" />);
    fireEvent.click(screen.getByText('fitness'));
    expect(mockPush).toHaveBeenCalledWith(expect.not.stringContaining('tag='));
  });

  it('clicking inactive tag sets tag param', () => {
    render(<TagFilterRow tags={['fitness', 'mindset']} activeTag={null} />);
    fireEvent.click(screen.getByText('mindset'));
    expect(mockPush).toHaveBeenCalledWith('/articles?tag=mindset');
  });
});
