# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | ✅ Yes     |
| < 1.0   | ❌ No      |

## Reporting a Vulnerability

**Please do not report security vulnerabilities via public GitHub issues.**

Email security reports to **security@leadlocal.io** with:

1. A clear description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. (Optional) Suggested fix or mitigation

We will acknowledge your report within **48 hours** and aim to resolve critical vulnerabilities within **7 days**.

---

## Security Architecture

### Authentication

| Measure | Implementation |
|---------|----------------|
| Password storage | `bcryptjs` with cost factor 10 (≈ 100ms/hash) |
| Session strategy | JWT via NextAuth — no server-side session storage |
| Session lifetime | Controlled by `NEXTAUTH_SECRET` signing |
| Constant-time comparison | Dummy `bcrypt.compare` runs even for unknown emails to prevent user enumeration |

### Login Protection

- **Account lockout**: After 5 consecutive failed login attempts, the account is locked for 15 minutes. The counter resets to 0 on successful login.
- **Unknown user protection**: A dummy bcrypt comparison runs when the email is not found, so response time is identical for known and unknown accounts (prevents timing-based user enumeration).
- **Account deactivation**: Admins can deactivate accounts; deactivated accounts are rejected before any password check.

### Input Validation

- All form data is validated server-side using **Zod schemas** before any DB write.
- HTML `minLength`/`maxLength`/`pattern`/`required` constraints are client-side hints only — never relied upon for security.

### Content Moderation

- **FLAGGED (contact info)**: Phone numbers, email addresses, URLs, and social media handles in user-submitted content return a form error (no DB record created). The user must remove the content.
- **REJECTED (prohibited keywords)**: Content matching prohibited keywords (weapons, drugs, trafficking) is saved with `PENDING_MODERATION` status for admin review — it is never shown publicly until an admin approves it.

### Payments

- Payment card data is **never stored** by LeadLocal.
- All payment processing goes through **Stripe**. LeadLocal stores only: Stripe Customer ID, plan code, and subscription status.
- Stripe webhooks are verified using **HMAC-SHA256** via `stripe.webhooks.constructEvent()`. Requests without a valid `stripe-signature` header are rejected with HTTP 400.

### Contact Data Protection

- Client phone numbers and emails are stored in `ClientProfile.phonePrivate` / `emailPrivate` — they are **never included in API responses or page renders** for public requests or for Contractors who have not been awarded.
- Contact details are only surfaced in the `Conversation` detail page **after** `conversation.isAwarded === true` — set atomically in the same DB transaction as the bid award.

### Authorization

- All server actions begin with `auth()` / `requireRole()` checks. No privileged operation depends solely on client-supplied data.
- `requireRole` throws and redirects to `/login` for unauthenticated requests, or `/` for insufficient role.
- `clientId` / `contractorId` ownership is always verified against the session user ID before DB mutations.

### SQL Injection

- All database access goes through **Prisma ORM** with parameterized queries. Raw SQL is not used.

### XSS Prevention

- React automatically escapes all string content rendered in JSX.
- `dangerouslySetInnerHTML` is not used anywhere in the codebase.

### CSRF Protection

- Next.js Server Actions use **Origin header validation** internally (same-origin enforcement).
- Form actions are bound to the server action URL; they cannot be triggered cross-origin.

---

## Environment Variables Checklist

Ensure all of the following are set in production:

```env
# Required
DATABASE_URL=
NEXTAUTH_SECRET=           # min 32 chars, randomly generated
NEXTAUTH_URL=              # your public domain, e.g. https://leadlocal.io

# Stripe (required for real payments)
STRIPE_SECRET_KEY=         # sk_live_...
STRIPE_WEBHOOK_SECRET=     # whsec_...
STRIPE_PRICE_CLIENT_STARTER=   # price_...
STRIPE_PRICE_CLIENT_PRO=       # price_...
STRIPE_PRICE_CONTRACTOR_PRO=   # price_...
```

Failing to set `STRIPE_SECRET_KEY` puts billing in **mock mode** (subscriptions are created in the DB without real payment). This is intentional for development but **must not** be used in production.

---

## Dependency Security

Run `npm audit` regularly. Critical or high-severity vulnerabilities in dependencies should be patched or mitigated before deploying.

```bash
npm audit
npm audit fix
```
