import { render, screen, fireEvent } from '@testing-library/react';
import { MobileMenu } from '@/components/layout/MobileMenu';

jest.mock('@/app/(auth)/actions', () => ({
  signOut: jest.fn(),
}));

describe('MobileMenu', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<MobileMenu isOpen={false} onClose={jest.fn()} />);
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders nav links when open', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Academy')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('shows Portal link and Log Out button when user is provided', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={jest.fn()}
        user={{ email: 'test@example.com', displayName: 'Test' }}
      />,
    );
    expect(screen.getByText('Portal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });

  it('shows Join and Log In links when no user', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Join')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.queryByText('Portal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = jest.fn();
    render(<MobileMenu isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close navigation menu'));
    expect(onClose).toHaveBeenCalled();
  });
});
