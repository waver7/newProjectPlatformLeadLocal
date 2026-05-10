import { prisma } from './prisma';
import { stripe, PLANS, type PlanCode } from './stripe';

// ─── Subscription queries ────────────────────────────────────────────────────

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const now = new Date();
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE', startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { endsAt: 'desc' },
  });
  return !!sub;
}

/** Returns the active subscription record, or null. */
export async function getActiveSubscription(userId: string) {
  const now = new Date();
  return prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE', startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { endsAt: 'desc' },
  });
}

/** Check whether a client is allowed to post another request.
 *  Returns { allowed: true } or { allowed: false, reason: string }.
 */
export async function checkClientCanPost(
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getActiveSubscription(userId);

  if (!sub) {
    return { allowed: false, reason: 'no_subscription' };
  }

  const plan = PLANS[sub.planCode as PlanCode];
  if (!plan || !('maxRequests' in plan) || plan.maxRequests === null) {
    // Unknown plan or unlimited — allow
    return { allowed: true };
  }

  // Count requests posted in the current subscription period
  const used = await prisma.request.count({
    where: {
      clientId: userId,
      createdAt: { gte: sub.startsAt },
      isSoftDeleted: false,
    },
  });

  if (used >= plan.maxRequests) {
    return {
      allowed: false,
      reason: `quota_exceeded:${used}/${plan.maxRequests}`,
    };
  }

  return { allowed: true };
}

// ─── Mock / dev helpers ──────────────────────────────────────────────────────

/** Creates a one-day free trial subscription for a new client. */
export async function createTrialSubscription(userId: string) {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 1);
  return prisma.subscription.create({
    data: {
      userId,
      status: 'TRIALING',
      planCode: 'client-trial',
      amountCents: 0,
      startsAt: now,
      endsAt: end,
      provider: 'trial',
    },
  });
}

/** Creates a mock active subscription (for dev/demo use only). */
export async function createMockSubscription(userId: string, planCode: PlanCode = 'contractor-pro') {
  const plan = PLANS[planCode];
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + plan.durationDays);
  return prisma.subscription.create({
    data: {
      userId,
      status: 'ACTIVE',
      planCode,
      amountCents: plan.amountCents,
      startsAt: now,
      endsAt: end,
      provider: 'mock',
    },
  });
}

// ─── Stripe customer management ──────────────────────────────────────────────

/**
 * Retrieve or create a Stripe Customer for the given user.
 * Persists the customer ID on the User record so we reuse it.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  if (!stripe) throw new Error('Stripe is not configured');

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// ─── Webhook helpers ─────────────────────────────────────────────────────────

/** Maps a Stripe subscription status to the app's SubscriptionStatus enum. */
export function mapStripeStatus(
  stripeStatus: string
): 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'EXPIRED' {
  switch (stripeStatus) {
    case 'active':      return 'ACTIVE';
    case 'trialing':    return 'TRIALING';
    case 'past_due':    return 'PAST_DUE';
    case 'canceled':
    case 'incomplete_expired':
      return 'CANCELED';
    default:            return 'EXPIRED';
  }
}
