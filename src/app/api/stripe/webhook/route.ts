import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, getTierFromPriceId } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier as 'basic' | 'premium' | undefined;

        if (!userId || !tier) {
          console.error('[webhook] Missing metadata on checkout session');
          break;
        }

        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        await supabase
          .from('members')
          .update({
            tier,
            stripe_customer_id: customerId ?? null,
            stripe_subscription_id: subscriptionId ?? null,
          })
          .eq('id', userId);

        console.log(`[webhook] checkout.session.completed: user=${userId} tier=${tier}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        // Only upgrade tier for active subscriptions. If the subscription
        // moved to past_due/unpaid/incomplete, don't change the tier here —
        // let subscription.deleted handle the downgrade if it comes to that.
        if (subscription.status !== 'active') {
          console.log(`[webhook] subscription.updated: customer=${customerId} status=${subscription.status} — skipping tier change`);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const newTier = priceId ? getTierFromPriceId(priceId) : null;

        if (!newTier) {
          console.warn('[webhook] subscription.updated: unknown price ID', priceId);
          break;
        }

        await supabase
          .from('members')
          .update({ tier: newTier })
          .eq('stripe_customer_id', customerId);

        console.log(`[webhook] subscription.updated: customer=${customerId} tier=${newTier}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        await supabase
          .from('members')
          .update({
            tier: 'free',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId);

        console.log(`[webhook] subscription.deleted: customer=${customerId} downgraded to free`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(
          `[webhook] payment_failed: customer=${
            typeof invoice.customer === 'string'
              ? invoice.customer
              : invoice.customer?.id
          }`,
        );
        // Out of scope for v1. Future: send warning email or flag account.
        break;
      }

      default:
        console.log(`[webhook] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
