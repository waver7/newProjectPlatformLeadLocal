# LeadLocal MVP

LeadLocal is a production-style MVP local lead marketplace where clients post service requests for free and contractors pay subscription to bid.

## Tech stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth (Credentials provider)
- Zod validation
- Mock billing abstraction (Stripe-ready service layer)

## Core architecture
- `app/` pages + server actions
- `lib/` business logic (auth, billing, moderation, permissions)
- `prisma/schema.prisma` complete data model
- `prisma/seed.ts` demo data for all key flows

## Features implemented
- Public marketing + SEO pages
- Auth (register/login/logout)
- Role-based dashboards (client/contractor/admin)
- Client request posting with free-post limit enforced server-side
- Contractor bidding with required active subscription
- Award flow with single winner enforcement
- Backend contact reveal only for winning contractor
- Messaging with contact-sharing moderation block before award
- Admin moderation + users + settings
- In-app notifications
- Configurable free posting and subscription requirements

## Folder structure
```txt
app/
  actions/
  dashboard/
    admin/
    client/
    contractor/
  api/auth/[...nextauth]/
  requests/
  pricing/ categories/ about/ contact/ terms/ privacy/ guidelines/
components/
lib/
prisma/
  schema.prisma
  seed.ts
```

## Environment setup
1. Copy env file:
```bash
cp .env.example .env
```
2. Update `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
3. Optional for real emails: set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (otherwise emails are logged to console).

## Install and run
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### If `git pull` is blocked by local changes
When you see `Your local changes to the following files would be overwritten by merge` (for example `package.json`), choose one safe path:

```bash
# Option A: keep your local edits
 git stash
 git pull
 git stash pop
```

```bash
# Option B: discard local edits and sync to remote branch
 git reset --hard HEAD
 git pull
```

```bash
# Option C: commit local edits first
 git add .
 git commit -m "WIP local changes"
 git pull --rebase
```

### Windows / Prisma env note
If Prisma reports `Environment variable not found: DATABASE_URL`, ensure `.env` exists in the project root and rerun commands from that same folder.

## Build for production
```bash
npm run build
npm run start
```

## Migration steps
- Edit schema at `prisma/schema.prisma`
- Apply committed migrations: `npm run prisma:migrate`
- Create a new migration after schema changes: `npx prisma migrate dev --name <migration_name>`
- Run `npm run prisma:generate`

## Deployment notes
- Vercel + external Postgres (Railway/Neon/Render)
- Set env vars in host settings
- Run migration in CI/CD before serving traffic
- Billing service already isolated in `lib/billing.ts`, replace mock with Stripe webhooks + checkout later.

## Billing and moderation logic locations
- Billing rules: `lib/billing.ts` and bid gate in `app/actions/bid-actions.ts`
- Moderation rules: `lib/moderation.ts`
- Moderation persistence: `ModerationLog` model and actions in request/bid/message flows

## Demo credentials
Password for all demo users: `Password123!`
- Admin: `admin@leadlocal.dev`
- Client: `client1@leadlocal.dev`
- Contractor: `contractor1@leadlocal.dev`

## Route map
### Public
`/`, `/pricing`, `/categories`, `/requests`, `/requests/[id]`, `/about`, `/contact`, `/terms`, `/privacy`, `/guidelines`

### Auth
`/login`, `/register`, `/forgot-password`, `/reset-password`

### Client dashboard
`/dashboard/client`, `/dashboard/client/requests`, `/dashboard/client/requests/new`, `/dashboard/client/requests/[id]`, `/dashboard/client/requests/[id]/edit`

### Contractor dashboard
`/dashboard/contractor`, `/dashboard/contractor/requests`, `/dashboard/contractor/requests/[id]`, `/dashboard/contractor/bids`, `/dashboard/contractor/profile`, `/dashboard/contractor/billing`

### Admin
`/dashboard/admin`, `/dashboard/admin/users`, `/dashboard/admin/requests`, `/dashboard/admin/bids`, `/dashboard/admin/messages`, `/dashboard/admin/moderation`, `/dashboard/admin/settings`

## Future improvements
- Stripe checkout + webhook lifecycle
- Rate limiter integration (Upstash/Redis)
- File upload for request attachments
- Email verification/reset implementation
- Reviews and contractor verification workflow
- Saved leads and abuse-report workflow


## Password reset and email notifications
- `/forgot-password` sends a one-time reset link email.
- `/reset-password?token=...` validates token and updates password.
- New bids notify clients in-app and by email.
- Awarded bids notify winning contractor in-app and by email (with client contact details).
