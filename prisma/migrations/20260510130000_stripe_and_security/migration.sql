-- AlterTable: User — Stripe customer, login-security, and T&C fields
ALTER TABLE "User" ADD COLUMN "stripeCustomerId"    TEXT;
ALTER TABLE "User" ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lockedUntil"         TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "agreedToTermsAt"     TIMESTAMP(3);

-- AlterTable: Subscription — Stripe subscription and invoice tracking
ALTER TABLE "Subscription" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "stripeInvoiceId"      TEXT;
