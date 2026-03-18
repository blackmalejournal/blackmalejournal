import { render, screen } from '@testing-library/react';
import { HeroBanner } from '@/components/home/HeroBanner';

// No local framer-motion mock needed — tests/setup.ts provides a global Proxy mock
// that strips Framer-specific props and renders the correct HTML tag.

describe('HeroBanner', () => {
  it('renders the publication name', () => {
    render(<HeroBanner />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('THE BLACK MALE JOURNAL');
  });

  it('renders a publication identifier stamp', () => {
    render(<HeroBanner />);
    expect(screen.getByText(/Vol\. I/i)).toBeInTheDocument();
  });

  it('renders the three-lens footer', () => {
    render(<HeroBanner />);
    expect(screen.getByText(/Health.*Philosophy.*Politics/i)).toBeInTheDocument();
  });

  it('renders a CTA link to briefings', () => {
    render(<HeroBanner />);
    const cta = screen.getByRole('link', { name: /Read the Latest Briefing/i });
    expect(cta).toHaveAttribute('href', '/briefings');
  });

  it('does not use drop shadows or gradients (brand compliance)', () => {
    const { container } = render(<HeroBanner />);
    const allElements = container.querySelectorAll('*');
    allElements.forEach((el) => {
      if (typeof el.className === 'string') {
        expect(el.className).not.toMatch(/shadow-lg|bg-gradient/);
      }
    });
  });
});
