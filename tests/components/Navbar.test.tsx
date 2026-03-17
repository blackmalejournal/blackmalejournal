import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/layout/Navbar';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/app/(auth)/actions', () => ({
  signOut: jest.fn(),
}));

describe('Navbar', () => {
  it('renders logo and nav links', () => {
    render(<Navbar />);
    expect(screen.getByText('The Black Male Journal')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Academy')).toBeInTheDocument();
  });

  it('shows Login/Join buttons when no user', () => {
    render(<Navbar />);
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Join')).toBeInTheDocument();
  });

  it('shows user dropdown when user provided', () => {
    render(<Navbar user={{ email: 'test@example.com', displayName: 'Tester' }} />);
    // User dropdown renders the initial letter
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('has aria labels for accessibility', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('The Black Male Journal — Home')).toBeInTheDocument();
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
  });

  it('sets aria-current="page" on active Home link', () => {
    render(<Navbar />);
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current on inactive links', () => {
    render(<Navbar />);
    const aboutLink = screen.getByRole('link', { name: 'About' });
    expect(aboutLink).not.toHaveAttribute('aria-current');
  });
});
