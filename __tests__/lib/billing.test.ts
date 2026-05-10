/**
 * Tests for lib/billing.ts helper functions.
 * Prisma is mocked so no database connection is required.
 */

// Mock prisma before importing billing functions
jest.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    request: {
      count: jest.fn(),
    },
    user: {
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock stripe so billing functions work without real keys
jest.mock('@/lib/stripe', () => ({
  stripe: null,
  PLANS: {
    'client-trial':   { label: 'Free Trial',  amountCents: 0,    maxRequests: 1,   durationDays: 1,  stripePriceId: null, role: 'CLIENT' },
    'client-starter': { label: 'Starter',     amountCents: 500,  maxRequests: 10,  durationDays: 30, stripePriceId: null, role: 'CLIENT' },
    'client-pro':     { label: 'Pro',          amountCents: 1000, maxRequests: 100, durationDays: 30, stripePriceId: null, role: 'CLIENT' },
    'contractor-pro': { label: 'Contractor Pro', amountCents: 1000, maxRequests: null, durationDays: 30, stripePriceId: null, role: 'CONTRACTOR' },
  },
  requirePriceId: jest.fn(),
}));

import { hasActiveSubscription, getActiveSubscription, checkClientCanPost, mapStripeStatus } from '@/lib/billing';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const now = new Date();
const past = new Date(now.getTime() - 1000 * 60 * 60 * 24);      // 1 day ago
const future = new Date(now.getTime() + 1000 * 60 * 60 * 24);    // 1 day from now

function makeSub(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub-1',
    userId: 'user-1',
    status: 'ACTIVE' as const,
    planCode: 'client-starter',
    amountCents: 500,
    currency: 'USD',
    startsAt: past,
    endsAt: future,
    provider: 'stripe',
    providerRef: null,
    stripeSubscriptionId: 'sub_stripe_123',
    stripeInvoiceId: null,
    createdAt: past,
    updatedAt: now,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── hasActiveSubscription ────────────────────────────────────────────────
describe('hasActiveSubscription', () => {
  it('returns true when an active subscription is found', async () => {
    (mockPrisma.subscription.findFirst as jest.Mock).mockResolvedValue(makeSub());
    expect(await hasActiveSubscription('user-1')).toBe(true);
  });

  it('returns false when no subscription is found', async () => {
    (mockPrisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
    expect(await hasActiveSubscription('user-1')).toBe(false);
  });
});

// ─── getActiveSubscription ────────────────────────────────────────────────
describe('getActiveSubscription', () => {
  it('returns the subscription record', async () => {
    const sub = makeSub();
    (mockPrisma.subscription.findFirst as jest.Mock).mockResolvedValue(sub);
    expect(await getActiveSubscription('user-1')).toEqual(sub);
  });

  it('returns null when no active subscription', async () => {
    (mockPrisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
    expect(await getActiveSubscription('user-1')).toBeNull();
  });
});

// ─── checkClientCanPost ───────────────────────────────────────────────────
describe('checkClientCanPost', () => {
  it('returns not allowed when there is no subscription', async () => {
    (mockPrisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
    const result = await checkClientCanPost('user-1');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('no_subscription');
  });

  it('allows posting when under the plan quota', async () => {
    (mockPrisma.subscription.findFirst as jest.Mock).mockResolvedValue(makeSub({ planCode: 'client-starter' }));
    (mockPrisma.request.count as jest.Mock).mockResolvedValue(5); // 5 of 10 used
    const result = await checkClientCanPost('user-1');
    expect(result.allowed).toBe(true);
  });

  it('denies posting when quota is exhausted', async () => {
    (mockPrisma.subscription.findFirst as jest.Mock).mockResolvedValue(makeSub({ planCode: 'client-starter' }));
    (mockPrisma.request.count as jest.Mock).mockResolvedValue(10); // all 10 used
    const result = await checkClientCanPost('user-1');
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/quota_exceeded/);
  });

  it('allows posting at the edge of the quota (used = maxRequests - 1)', async () => {
    (mockPrisma.subscription.findFirst as jest.Mock).mockResolvedValue(makeSub({ planCode: 'client-pro' }));
    (mockPrisma.request.count as jest.Mock).mockResolvedValue(99); // 99 of 100
    const result = await checkClientCanPost('user-1');
    expect(result.allowed).toBe(true);
  });

  it('allows posting for contractor-pro (unlimited, maxRequests = null)', async () => {
    (mockPrisma.subscription.findFirst as jest.Mock).mockResolvedValue(makeSub({ planCode: 'contractor-pro' }));
    const result = await checkClientCanPost('user-1');
    expect(result.allowed).toBe(true);
    // request.count should NOT be called for unlimited plans
    expect(mockPrisma.request.count).not.toHaveBeenCalled();
  });
});

// ─── mapStripeStatus ──────────────────────────────────────────────────────
describe('mapStripeStatus', () => {
  const cases: Array<[string, string]> = [
    ['active',             'ACTIVE'],
    ['trialing',           'TRIALING'],
    ['past_due',           'PAST_DUE'],
    ['canceled',           'CANCELED'],
    ['incomplete_expired', 'CANCELED'],
    ['unpaid',             'EXPIRED'],
    ['incomplete',         'EXPIRED'],
  ];

  it.each(cases)('maps "%s" → "%s"', (stripeStatus, expected) => {
    expect(mapStripeStatus(stripeStatus)).toBe(expected);
  });
});
