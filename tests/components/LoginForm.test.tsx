import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/app/(auth)/login/LoginForm';

jest.mock('@/app/(auth)/actions', () => ({
  login: jest.fn(),
  signInWithMagicLink: jest.fn(),
}));

describe('LoginForm', () => {
  it('renders password form by default', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('renders email and password fields in password mode', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('switches to magic link mode on toggle', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /magic link/i }));
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
  });

  it('magic link mode shows only email field', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /magic link/i }));
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });

  it('shows "Log In" and "Send Magic Link" buttons respectively', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /send magic link/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /magic link/i }));
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
  });
});
