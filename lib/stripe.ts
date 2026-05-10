import Stripe from 'stripe';

// Stripe client — null when no secret key is configured (dev/test without real keys).
// All callers must check for null and fall back gracefully.
export const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  : null;

/** Canonical plan definitions shared by UI, actions, and webhook handler. */
export const PLANS = {
  'client-trial': {
    label: 'Free Trial',
    description: '1 day, 1 request — no card required',
    amountCents: 0,
    maxRequests: 1,
    durationDays: 1,
    stripePriceId: null,
    role: 'CLIENT' as const,
  },
  'client-starter': {
    label: 'Client Starter',
    description: '10 requests per month',
    amountCents: 500,
    maxRequests: 10,
    durationDays: 30,
    stripePriceId: process.env.STRIPE_PRICE_CLIENT_STARTER ?? null,
    role: 'CLIENT' as const,
  },
  'client-pro': {
    label: 'Client Pro',
    description: '100 requests per month',
    amountCents: 1000,
    maxRequests: 100,
    durationDays: 30,
    stripePriceId: process.env.STRIPE_PRICE_CLIENT_PRO ?? null,
    role: 'CLIENT' as const,
  },
  'contractor-pro': {
    label: 'Contractor Pro',
    description: 'Unlimited bids per month',
    amountCents: 1000,
    maxRequests: null,
    durationDays: 30,
    stripePriceId: process.env.STRIPE_PRICE_CONTRACTOR_PRO ?? null,
    role: 'CONTRACTOR' as const,
  },
} as const;

export type PlanCode = keyof typeof PLANS;

/** Resolve a plan's Stripe Price ID, throws if not configured. */
export function requirePriceId(planCode: PlanCode): string {
  const plan = PLANS[planCode];
  if (!plan.stripePriceId) {
    throw new Error(
      `Stripe Price ID for plan "${planCode}" is not configured. ` +
        `Set the corresponding STRIPE_PRICE_* environment variable.`
    );
  }
  return plan.stripePriceId;
}
