import { render } from '@testing-library/react';
import { GrainOverlay } from '@/components/ui/GrainOverlay';

describe('GrainOverlay', () => {
  it('renders with default opacity 0.04', () => {
    const { container } = render(<GrainOverlay />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.opacity).toBe('0.04');
  });

  it('applies custom opacity', () => {
    const { container } = render(<GrainOverlay opacity={0.1} />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.opacity).toBe('0.1');
  });

  it('has aria-hidden="true"', () => {
    const { container } = render(<GrainOverlay />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveAttribute('aria-hidden', 'true');
  });
});
