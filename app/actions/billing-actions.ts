'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { stripe, PLANS, requirePriceId, type PlanCode } from '@/lib/stripe';
import { getOrCreateStripeCustomer, createMockSubscription } from '@/lib/billing';

function billingReturnUrl(role: string) {
  if (role === 'CLIENT') return `${process.env.NEXTAUTH_URL}/dashboard/client/billing`;
  return `${process.env.NEXTAUTH_URL}/dashboard/contractor/billing`;
}

export async function createCheckoutSessionAction(planCode: PlanCode) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id: userId, email, role } = session.user;
  if (!email) redirect('/login');

  const plan = PLANS[planCode];
  if (!plan) throw new Error(`Unknown plan: ${planCode}`);

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
    allow_promotion_codes: true,
  });

  if (!checkoutSession.url) throw new Error('Stripe did not return a checkout URL');
  redirect(checkoutSession.url);
}

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
