import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, PLANS, type PlanCode } from '@/lib/stripe';
import { mapStripeStatus } from '@/lib/billing';
import { prisma } from '@/lib/prisma';

/**
 * Stripe requires the raw request body to verify the webhook signature.
 * Next.js App Router streams it as text via request.text().
 */
export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    console.error(`[stripe/webhook] Handler error for ${event.type}:`, err);
    // Return 200 to prevent Stripe retrying an event we can't process
    return NextResponse.json({ error: 'Handler error', received: true }, { status: 200 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      // Ignore unhandled event types — Stripe sends many; only act on relevant ones
      break;
  }
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planCode = session.metadata?.planCode as PlanCode | undefined;

  if (!userId || !planCode) {
    console.error('[stripe/webhook] checkout.session.completed missing userId or planCode metadata');
    return;
  }

  const plan = PLANS[planCode];
  if (!plan) {
    console.error(`[stripe/webhook] Unknown planCode: ${planCode}`);
    return;
  }

  const stripeSubscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null;

  // Save Stripe customer ID on the user record
  if (session.customer) {
    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer.id;
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + plan.durationDays);

  // Cancel any existing active subscriptions for this user first
  await prisma.subscription.updateMany({
    where: { userId, status: { in: ['ACTIVE', 'TRIALING'] } },
    data: { status: 'CANCELED' },
  });

  await prisma.subscription.create({
    data: {
      userId,
      status: 'ACTIVE',
      planCode,
      amountCents: plan.amountCents,
      startsAt: now,
      endsAt: end,
      provider: 'stripe',
      stripeSubscriptionId,
      stripeInvoiceId: typeof session.invoice === 'string' ? session.invoice : null,
    },
  });
}

async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSub.id },
  });
  if (!sub) return;

  const newStatus = mapStripeStatus(stripeSub.status);
  const end = new Date(stripeSub.current_period_end * 1000);

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: newStatus, endsAt: end },
  });
}

async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: stripeSub.id },
    data: { status: 'CANCELED' },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const stripeSubscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id ?? null;

  if (!stripeSubscriptionId) return;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId },
    data: { status: 'PAST_DUE' },
  });
}
