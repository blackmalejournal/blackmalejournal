import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SupportFlow } from '@/app/(public)/support/SupportFlow';

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('SupportFlow', () => {
  it('renders all 4 preset amounts ($5, $15, $25, $50)', () => {
    render(<SupportFlow />);
    expect(screen.getByText('$5')).toBeInTheDocument();
    expect(screen.getByText('$15')).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('default selected amount is $15', () => {
    render(<SupportFlow />);
    const submitBtn = screen.getByRole('button', { name: /support bmj/i });
    expect(submitBtn).toHaveTextContent('$15.00');
  });

  it('clicking preset updates selected amount', () => {
    render(<SupportFlow />);
    fireEvent.click(screen.getByText('$25'));
    const submitBtn = screen.getByRole('button', { name: /support bmj/i });
    expect(submitBtn).toHaveTextContent('$25.00');
  });

  it('custom amount input activates custom mode', () => {
    render(<SupportFlow />);
    const input = screen.getByLabelText(/custom amount/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '42' } });
    const submitBtn = screen.getByRole('button', { name: /support bmj/i });
    expect(submitBtn).toHaveTextContent('$42.00');
  });

  it('fee calculation: $15 with coverFees shows $15.75', () => {
    render(<SupportFlow />);
    const checkbox = screen.getByLabelText(/cover processing fees/i);
    fireEvent.click(checkbox);
    const submitBtn = screen.getByRole('button', { name: /support bmj/i });
    // ceil(((15 + 0.30) / (1 - 0.029)) * 100) / 100 = 15.76
    expect(submitBtn).toHaveTextContent('$15.76');
  });

  it('disables submit button for amount < $1', () => {
    render(<SupportFlow />);
    const input = screen.getByLabelText(/custom amount/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '0.50' } });
    const submitBtn = screen.getByRole('button', { name: /support bmj/i });
    expect(submitBtn).toBeDisabled();
  });

  it('monthly/one-time toggle works', () => {
    render(<SupportFlow />);
    const submitBtn = screen.getByRole('button', { name: /support bmj/i });
    expect(submitBtn).toHaveTextContent('/mo');

    fireEvent.click(screen.getByText('One-time'));
    expect(submitBtn).not.toHaveTextContent('/mo');

    fireEvent.click(screen.getByText('Monthly'));
    expect(submitBtn).toHaveTextContent('/mo');
  });

  it('submit button disabled during loading', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    render(<SupportFlow />);
    const submitBtn = screen.getByRole('button', { name: /support bmj/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
      expect(submitBtn).toHaveTextContent('Redirecting to checkout...');
    });
  });

  it('successful submit calls donate API with correct payload', async () => {
    const MOCK_CHECKOUT_URL = 'https://example.com/checkout-session';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: MOCK_CHECKOUT_URL }),
    });
    render(<SupportFlow />);
    fireEvent.click(screen.getByRole('button', { name: /support bmj/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/donate', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"amount":15'),
      }));
    });
  });

  it('API error shows error message', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Payment failed' }),
    });
    render(<SupportFlow />);
    fireEvent.click(screen.getByRole('button', { name: /support bmj/i }));
    expect(await screen.findByText('Payment failed')).toBeInTheDocument();
  });

  it('newsletter opt-in shows email field', () => {
    render(<SupportFlow />);
    expect(screen.queryByPlaceholderText('your@email.com')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/subscribe to the newsletter/i));
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
  });

  it('newsletter subscribe called before donate when opted in', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }) // newsletter
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://example.com/mock-checkout' }),
      }); // donate

    render(<SupportFlow />);
    fireEvent.click(screen.getByLabelText(/subscribe to the newsletter/i));
    const emailInput = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /support bmj/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/newsletter/subscribe', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', source: 'support-page' }),
      }));
      expect(fetchMock).toHaveBeenCalledWith('/api/stripe/donate', expect.anything());
    });
  });
});
