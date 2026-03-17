import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer />);
    expect(screen.getByText('The Black Male Journal')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Academy')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('YouTube')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter / X')).toBeInTheDocument();
  });

  it('renders copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/2026 The Black Male Journal/)).toBeInTheDocument();
  });
});

describe('Footer support links', () => {
  it('renders Patreon under "Support the Work" heading', () => {
    render(<Footer />);
    expect(screen.getByText('Support the Work')).toBeInTheDocument();
    const patreonLink = screen.getByRole('link', { name: /Patreon/i });
    expect(patreonLink).toHaveAttribute('href', 'https://patreon.com/BlackMaleJournal');
  });

  it('renders Patreon description text', () => {
    render(<Footer />);
    expect(screen.getByText(/Join the Inner Circle/i)).toBeInTheDocument();
  });

  it('groups PayPal, CashApp, Venmo under "Direct Support"', () => {
    render(<Footer />);
    expect(screen.getByText('Direct Support')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /PayPal/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /CashApp/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Venmo/i })).toBeInTheDocument();
  });
});
