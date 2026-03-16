import { render, screen } from '@testing-library/react';
import { LensBadge } from '@/components/brand/LensBadge';
import type { Lens } from '@/lib/supabase/types';

describe('LensBadge', () => {
  const lenses: { lens: Lens; label: string }[] = [
    { lens: 'health', label: 'Health' },
    { lens: 'philosophy', label: 'Philosophy' },
    { lens: 'politics', label: 'Politics' },
  ];

  it.each(lenses)('renders "$label" for $lens lens', ({ lens, label }) => {
    render(<LensBadge lens={lens} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LensBadge lens="health" className="mt-2" />);
    const el = screen.getByText('Health');
    expect(el.className).toContain('mt-2');
  });

  it('renders as an inline span', () => {
    render(<LensBadge lens="politics" />);
    const el = screen.getByText('Politics');
    expect(el.tagName).toBe('SPAN');
  });
});
