import { render, screen } from '@testing-library/react';
import { PageTransition } from '@/components/motion/PageTransition';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: jest.fn(({ children, className }: Record<string, unknown>) => (
      <div data-testid="page-transition" className={className as string}>
        {children as React.ReactNode}
      </div>
    )),
  },
}));

describe('PageTransition', () => {
  it('renders children', () => {
    render(
      <PageTransition>
        <p>Page content</p>
      </PageTransition>,
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('wraps content in motion div', () => {
    render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>,
    );
    expect(screen.getByTestId('page-transition')).toBeInTheDocument();
  });
});
