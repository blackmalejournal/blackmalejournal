import { render, screen } from '@testing-library/react';
import { ThreeLenses } from '@/components/home/ThreeLenses';

describe('ThreeLenses', () => {
  it('renders all three lens cards', () => {
    render(<ThreeLenses />);
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Philosophy')).toBeInTheDocument();
    expect(screen.getByText('Politics')).toBeInTheDocument();
  });

  it('links each lens to the correct articles filter', () => {
    render(<ThreeLenses />);
    const healthLink = screen.getByRole('link', { name: /health/i });
    expect(healthLink).toHaveAttribute('href', '/articles?lens=health');
  });

  it('does not use shadow effects on lens cards (brand compliance)', () => {
    const { container } = render(<ThreeLenses />);
    const links = container.querySelectorAll('a');
    links.forEach((link) => {
      expect(link.className).not.toMatch(/shadow-\[/);
    });
  });
});
