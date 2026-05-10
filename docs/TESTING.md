# Testing Guide

## Overview

LeadLocal uses **Jest** with **ts-jest** for unit testing. Tests cover pure business logic: content moderation, geographic calculations, schema validation, and billing helpers. Server actions and database interactions are tested via mocked Prisma clients.

## Setup

Install dependencies (if not already done):

```bash
npm install
```

## Running Tests

```bash
# Run all tests once
npm test

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

## Test Files

| File | What it tests |
|------|--------------|
| `__tests__/lib/moderation.test.ts` | `moderateText()` — approved content, phone/email/URL/handle detection, prohibited keywords |
| `__tests__/lib/geo.test.ts` | `lookupZip()` — ZIP lookup, whitespace trimming, unknown ZIPs; `distanceMiles()` — real Ohio city distances, symmetry, same-point |
| `__tests__/lib/schemas.test.ts` | All Zod schemas — valid/invalid inputs, coercion, optional fields |
| `__tests__/lib/billing.test.ts` | `hasActiveSubscription`, `getActiveSubscription`, `checkClientCanPost`, `mapStripeStatus` — Prisma fully mocked |

## Writing New Tests

Place tests in `__tests__/lib/` or `__tests__/actions/` following the pattern `<file-under-test>.test.ts`.

**Mocking Prisma:**

```ts
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    // ... other models
  },
}));

import { prisma } from '@/lib/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeEach(() => jest.clearAllMocks());

it('does something', async () => {
  (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: 'x@x.com' });
  // ...
});
```

**Mocking external modules (Stripe, email):**

```ts
jest.mock('@/lib/stripe', () => ({ stripe: null, PLANS: { ... } }));
jest.mock('@/lib/email', () => ({ sendPasswordResetEmail: jest.fn() }));
```

## Coverage Targets

| Area | Target |
|------|--------|
| `lib/moderation.ts` | 100% |
| `lib/geo.ts` | 100% |
| `lib/schemas.ts` | 100% (via parse tests) |
| `lib/billing.ts` | ≥ 90% |

Run `npm run test:coverage` to see the current report. Coverage is collected from `lib/**/*.ts` and `app/actions/**/*.ts`.

## What Is NOT Unit-Tested

The following require integration or E2E tests (not currently in scope):

- **Server actions** that make real DB calls (test with a test database or Playwright E2E)
- **NextAuth flows** (login/register/session) — test with Playwright
- **Stripe webhook endpoint** — test with `stripe-cli trigger`
- **UI components** — test with React Testing Library if added

## CI Integration

Add the following to your CI pipeline (GitHub Actions example):

```yaml
- name: Run unit tests
  run: npm test -- --ci --forceExit
```

The `--ci` flag treats failing snapshots as errors and disables watch mode.
