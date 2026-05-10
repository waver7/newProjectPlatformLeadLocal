'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { stripe, PLANS, requirePriceId, type PlanCode } from '@/lib/stripe';
import { getOrCreateStripeCustomer, createMockSubscription } from '@/lib/billing';

function billingReturnUrl(role: string) {
  if (role === 'CLIENT') return `${process.env.NEXTAUTH_URL}/dashboard/client/billing`;
  return `${process.env.NEXTAUTH_URL}/dashboard/contractor/billing`;
}

/**
 * Creates a Stripe Checkout Session for the given plan and redirects the user to it.
 * Falls back to mock subscription creation when Stripe is not configured (dev mode).
 */
export async function createCheckoutSessionAction(planCode: PlanCode) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id: userId, email, role } = session.user;
  if (!email) redirect('/login');

  const plan = PLANS[planCode];
  if (!plan) throw new Error(`Unknown plan: ${planCode}`);

  // Dev/demo fallback: no Stripe keys configured
  if (!stripe) {
    await createMockSubscription(userId, planCode);
    redirect(billingReturnUrl(role ?? 'CLIENT') + '?mock=1');
  }

  const priceId = requirePriceId(planCode);
  const customerId = await getOrCreateStripeCustomer(userId, email);
  const returnBase = billingReturnUrl(role ?? 'CLIENT');

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${returnBase}?success=1`,
    cancel_url: `${returnBase}?canceled=1`,
    metadata: { userId, planCode },
    // Allow promo codes on the checkout page
    allow_promotion_codes: true,
    // Pre-fill email so the user doesn't have to type it again
    customer_update: { email: 'auto' },
  });

  if (!checkoutSession.url) throw new Error('Stripe did not return a checkout URL');
  redirect(checkoutSession.url);
}

/**
 * Opens the Stripe Customer Portal so the user can manage/cancel their subscription.
 * Falls back to the billing page when Stripe is not configured.
 */
export async function openBillingPortalAction() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id: userId, role } = session.user;
  const returnUrl = billingReturnUrl(role ?? 'CLIENT');

  if (!stripe) redirect(returnUrl + '?mock=1');

  const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (!user.stripeCustomerId) {
    redirect(returnUrl + '?no_customer=1');
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });

  redirect(portalSession.url);
}
