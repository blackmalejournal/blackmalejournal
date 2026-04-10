import { render, screen } from '@testing-library/react';
import { PageTransition } from '@/components/motion/PageTransition';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
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

  it('wraps content in a div with fade-in animation classes', () => {
    const { container } = render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>,
    );
    const wrapper = container.querySelector('.animate-fade-in');
    expect(wrapper).toBeTruthy();
    expect(wrapper).toHaveTextContent('Content');
  });
});
