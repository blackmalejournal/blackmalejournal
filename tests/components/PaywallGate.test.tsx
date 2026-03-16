import { render, screen } from '@testing-library/react';
import { PaywallGate } from '@/components/content/PaywallGate';

const defaultProps = {
  requiredTier: 'premium' as const,
  previewBody: 'This is a preview of the article content.',
};

describe('PaywallGate', () => {
  it('shows preview text', () => {
    render(<PaywallGate {...defaultProps} />);
    expect(screen.getByText(/This is a preview of the article content/)).toBeInTheDocument();
  });

  it('shows "Upgrade to Premium" when logged in with premium tier', () => {
    render(<PaywallGate {...defaultProps} isLoggedIn />);
    expect(screen.getByText(/Upgrade to Premium to read this/)).toBeInTheDocument();
  });

  it('shows login link when not logged in', () => {
    render(<PaywallGate {...defaultProps} />);
    expect(screen.getByText(/Already a member\? Log in/)).toBeInTheDocument();
    const loginLink = screen.getByRole('link', { name: /Log in/ });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('links to /signup?tier={tier}', () => {
    render(<PaywallGate {...defaultProps} />);
    const subscribeLink = screen.getByRole('link', { name: /Subscribe/ });
    expect(subscribeLink).toHaveAttribute('href', '/signup?tier=premium');
  });
});
