import { getStripe, getPriceIdForTier } from '@/lib/stripe/config';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  tier: 'basic' | 'premium',
): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    customer_email: userEmail,
    line_items: [
      {
        price: getPriceIdForTier(tier),
        quantity: 1,
      },
    ],
    metadata: { userId, tier },
    success_url: `${siteUrl}/portal?checkout=success`,
    cancel_url: `${siteUrl}/portal?checkout=cancelled`,
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return session.url;
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${siteUrl}/portal/settings`,
  });

  return session.url;
}
