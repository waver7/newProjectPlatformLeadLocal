# LeadLocal

**Connecting Ohio homeowners with trusted local contractors.**

LeadLocal is a production-ready local lead marketplace that makes it easy for homeowners and property managers to post service requests and receive competitive bids from vetted contractors — all within their community.

---

## Mission

We believe local service work should be straightforward: homeowners describe what they need, contractors compete on merit and price, and everyone gets a fair deal. LeadLocal removes the friction of cold-calling, guessing on referrals, and worrying about contact-info privacy. We start in Ohio because we know the market — and we'll grow from there.

**Core values:**
- **Privacy first** — client contact info is revealed only to the contractor they choose.
- **Fairness** — contractors pay a single flat subscription, no per-lead surprise fees.
- **Transparency** — all content is moderated; all awards are final and auditable.

---

## Feature Highlights

| Feature | Details |
|---------|---------|
| Service request posting | Title, description, category, location (city + ZIP), urgency, budget, preferred date |
| Bid system | Contractors bid with price, timeline, and message; clients award one winner |
| Contact protection | Phone/email hidden until bid is awarded, then revealed only to the winner |
| Content moderation | Auto-detect contact info (form error) and prohibited keywords (admin review queue) |
| Subscriptions | Stripe-powered recurring billing; 1-day free trial for new clients |
| ZIP proximity search | Search requests within N miles using Haversine formula over 200+ Ohio ZIPs |
| Secure messaging | In-platform chat per bid; contact sharing blocked until award |
| Admin panel | Moderation queue, user management, configurable platform settings |
| Password reset | Secure token-based reset flow with expiring links |
| Login protection | 5-attempt lockout for 15 minutes; constant-time comparison against unknown users |
| Unit tested | Jest test suite covering moderation, geo, schemas, and billing helpers |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS 3 with custom brand palette |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth v5 beta (Credentials provider, JWT sessions) |
| Payments | Stripe (Checkout + Billing Portal + Webhooks) |
| Validation | Zod |
| Testing | Jest + ts-jest |
| Email | Nodemailer (SMTP) with console fallback |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│                                                         │
│  Public pages    Auth pages    Dashboard (role-based)   │
│  /requests       /login        /dashboard/client        │
│  /pricing        /register     /dashboard/contractor    │
│  /terms          /forgot-…     /dashboard/admin         │
│  /privacy                                               │
└────────────────────────┬────────────────────────────────┘
                         │ Server Actions
┌────────────────────────▼────────────────────────────────┐
│                  Business Logic (lib/)                   │
│                                                         │
│  auth.ts        billing.ts     moderation.ts            │
│  geo.ts         permissions.ts stripe.ts                │
│  data.ts        email.ts       password-reset.ts        │
└────────────────────────┬────────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────▼────────────────────────────────┐
│                     PostgreSQL                          │
│                                                         │
│  User  Profile  ClientProfile  ContractorProfile        │
│  Request  Bid  Conversation  Message                    │
│  Subscription  CreditWallet  Notification               │
│  AdminSettings  ModerationLog  PasswordResetToken       │
└─────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  External Services                      │
│                                                         │
│  Stripe (payments)     SMTP server (email)              │
└─────────────────────────────────────────────────────────┘
```

### Key design patterns

- **Server actions** — all mutations go through `'use server'` actions, never client-side fetch.
- **Atomic DB operations** — race conditions (free post limit, bid award) use single `updateMany` with WHERE conditions.
- **Role guards** — `requireRole(['CLIENT'])` at the top of every page/action; no route trusts client-supplied identity.
- **Moderation pipeline** — `moderateText()` returns APPROVED / FLAGGED / REJECTED; FLAGGED gives the user an error to self-correct, REJECTED queues for admin review.

---

## Repository Structure

```
├── app/
│   ├── actions/          # Server actions (auth, requests, bids, billing, …)
│   ├── api/
│   │   ├── auth/         # NextAuth handler
│   │   └── stripe/webhook/  # Stripe webhook receiver
│   ├── dashboard/
│   │   ├── admin/        # Admin panel (moderation, users, settings)
│   │   ├── client/       # Client dashboard (requests, billing, messaging)
│   │   └── contractor/   # Contractor dashboard (jobs, bids, profile, billing)
│   ├── requests/         # Public request list + detail
│   ├── pricing/          # Pricing page
│   ├── terms/            # Terms & Conditions
│   ├── privacy/          # Privacy Policy
│   └── …                 # Other public pages
├── components/
│   ├── ui.tsx            # Design system (Button, Card, Badge, …)
│   └── nav.tsx           # Site navigation
├── lib/
│   ├── auth.ts           # NextAuth config + login rate-limiting
│   ├── billing.ts        # Subscription helpers + Stripe customer management
│   ├── geo.ts            # Ohio ZIP → lat/lon + Haversine distance
│   ├── moderation.ts     # Contact-info and keyword detection
│   ├── permissions.ts    # requireRole() guard
│   ├── stripe.ts         # Stripe client + plan definitions
│   └── schemas.ts        # Zod validation schemas
├── prisma/
│   ├── schema.prisma     # Full data model
│   ├── migrations/       # SQL migration history
│   └── seed.ts           # Demo data for all roles
├── __tests__/
│   └── lib/              # Unit tests (Jest + ts-jest)
├── docs/
│   └── TESTING.md        # Testing guide
└── SECURITY.md           # Security policy and architecture
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or hosted — Railway/Neon/Render/Supabase all work)

### 1. Clone and install

```bash
git clone https://github.com/waver7/newProjectPlatformLeadLocal.git
cd newProjectPlatformLeadLocal
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/leadlocal"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe — leave blank for mock/dev mode (subscriptions work without real payment)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_CLIENT_STARTER=
STRIPE_PRICE_CLIENT_PRO=
STRIPE_PRICE_CONTRACTOR_PRO=

# Email — leave blank to use console fallback
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM="noreply@leadlocal.io"
```

### 3. Set up database and seed

```bash
npm run db:setup
# Runs: prisma generate → prisma migrate deploy → prisma seed
```

### 4. Run development server

```bash
npm run dev
# → http://localhost:3000
```

---

## Demo Accounts

| Role | Email / Username | Password |
|------|-----------------|----------|
| Admin | `admin@leadlocal.dev` | `Password123!` |
| Admin (quick) | `admin` | `123` |
| Client | `client.demo` | `123456` |
| Contractor (active sub) | `contractor.demo` | `123456` |

---

## Payment Gate (Stripe)

LeadLocal uses Stripe for recurring subscriptions. In **development** (no `STRIPE_SECRET_KEY`), subscriptions are created in the database without real payment — the checkout button still redirects back immediately with a success state.

### Plans

| Plan | Price | Quota | Who |
|------|-------|-------|-----|
| Free Trial | $0 | 1 request / 1 day | New clients (auto-created on signup) |
| Client Starter | $5/month | 10 requests/month | Clients |
| Client Pro | $10/month | 100 requests/month | Clients |
| Contractor Pro | $10/month | Unlimited bids | Contractors |

### Stripe setup (production)

1. Create products and prices in the Stripe dashboard.
2. Copy the price IDs into your environment variables.
3. Set up a webhook endpoint pointing to `https://your-domain.com/api/stripe/webhook`.
4. Add the `STRIPE_WEBHOOK_SECRET` (from Stripe CLI or dashboard).
5. Enable **Customer Portal** in the Stripe dashboard for self-service management.

### Testing webhooks locally

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

---

## Unit Tests

```bash
npm test                  # run all tests
npm run test:coverage     # with coverage report
```

See [`docs/TESTING.md`](docs/TESTING.md) for the full testing guide.

---

## Security

See [`SECURITY.md`](SECURITY.md) for the full security policy, including vulnerability reporting, implementation details, and the environment variable checklist.

---

## Running in Production

```bash
npm run build
npm start
```

### Deployment (Vercel + external Postgres)

1. Push to GitHub.
2. Import the project in Vercel.
3. Set all environment variables in the Vercel dashboard.
4. Add a build step to run migrations:
   ```
   npx prisma migrate deploy && next build
   ```

---

## Database Migrations

```bash
# Apply all pending migrations (production / CI)
npm run prisma:migrate

# Create a new migration after schema changes (dev)
npx prisma migrate dev --name describe_your_change

# Regenerate Prisma client after schema change
npm run prisma:generate
```

---

## Routes Reference

### Public
`/` · `/pricing` · `/categories` · `/requests` · `/requests/[id]` · `/about` · `/contact` · `/terms` · `/privacy` · `/guidelines`

### Auth
`/login` · `/register` · `/forgot-password` · `/reset-password`

### Client dashboard
`/dashboard/client` · `/dashboard/client/requests` · `/dashboard/client/requests/new` · `/dashboard/client/requests/[id]` · `/dashboard/client/requests/[id]/edit` · `/dashboard/client/billing` · `/dashboard/client/conversation/[convId]`

### Contractor dashboard
`/dashboard/contractor` · `/dashboard/contractor/requests` · `/dashboard/contractor/requests/[id]` · `/dashboard/contractor/bids` · `/dashboard/contractor/profile` · `/dashboard/contractor/billing` · `/dashboard/contractor/conversation/[convId]`

### Admin
`/dashboard/admin` · `/dashboard/admin/users` · `/dashboard/admin/requests` · `/dashboard/admin/bids` · `/dashboard/admin/messages` · `/dashboard/admin/moderation` · `/dashboard/admin/settings`

### API
`/api/auth/[...nextauth]` · `/api/stripe/webhook`

---

## Contributing

1. Branch from `main` — use `feature/your-feature` naming.
2. Write or update tests for any changed business logic.
3. Run `npm test` and `npm run build` before opening a PR.
4. Follow the security guidelines in `SECURITY.md`.
