import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('PricingPage redirect', () => {
  it('redirects to /signup', async () => {
    const { default: PricingPage } = await import(
      '@/app/(public)/pricing/page'
    );

    PricingPage();

    expect(redirect).toHaveBeenCalledWith('/signup');
  });
});
