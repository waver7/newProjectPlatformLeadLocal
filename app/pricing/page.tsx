import Link from 'next/link';
import { auth } from '@/auth';
import { getActiveSubscription } from '@/lib/billing';

function CheckIcon({ light }: { light?: boolean }) {
  return (
    <svg className={`mt-0.5 h-5 w-5 shrink-0 ${light ? 'text-brand-200' : 'text-brand-500'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function PlanCard({
  badge,
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  highlighted,
  isCurrent,
  disabled,
}: {
  badge?: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  isCurrent?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={`relative flex flex-col rounded-2xl border p-8 shadow-card ${
      isCurrent
        ? 'border-green-400 ring-2 ring-green-300'
        : highlighted
          ? 'border-brand-500 bg-brand-600 text-white'
          : 'border-slate-200 bg-white'
    }`}>
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
          Your current plan
        </span>
      )}
      {!isCurrent && badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-amber-900">
          {badge}
        </span>
      )}

      <p className={`text-xs font-semibold uppercase tracking-wider ${highlighted && !isCurrent ? 'text-brand-200' : 'text-brand-600'}`}>{name}</p>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={`text-4xl font-extrabold ${highlighted && !isCurrent ? 'text-white' : 'text-slate-900'}`}>{price}</span>
        <span className={`text-sm ${highlighted && !isCurrent ? 'text-brand-200' : 'text-slate-500'}`}>{period}</span>
      </div>
      <p className={`mt-2 text-sm ${highlighted && !isCurrent ? 'text-brand-100' : 'text-slate-500'}`}>{description}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <CheckIcon light={highlighted && !isCurrent} />
            <span className={highlighted && !isCurrent ? 'text-brand-50' : 'text-slate-600'}>{f}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div className="mt-8 block rounded-xl border border-green-300 bg-green-50 px-6 py-3 text-center text-sm font-semibold text-green-700">
          ✓ Active plan
        </div>
      ) : disabled ? (
        <div className="mt-8 block rounded-xl border border-slate-200 bg-slate-100 px-6 py-3 text-center text-sm font-semibold text-slate-400 cursor-not-allowed">
          {cta}
        </div>
      ) : (
        <Link
          href={ctaHref}
          className={`mt-8 block rounded-xl px-6 py-3 text-center text-sm font-semibold transition-colors ${
            highlighted
              ? 'bg-white text-brand-700 hover:bg-brand-50'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

export default async function PricingPage() {
  const session = await auth();
  const activeSub = session?.user?.id ? await getActiveSubscription(session.user.id) : null;
  const activePlan = activeSub?.planCode ?? null;
  const hasAnySub = !!activeSub;

  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
          Ohio&apos;s Local Service Marketplace
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
          Simple, honest pricing
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-slate-500">
          No hidden fees. Post your first job with a free trial, or subscribe for ongoing access. Contractors pay one flat monthly rate.
        </p>

        {hasAnySub && (
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            You&apos;re on the <strong>{activeSub?.planCode === 'client-trial' ? 'Free Trial' : activePlan}</strong> plan
            {' · '}
            expires {new Date(activeSub!.endsAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Client plans */}
      <section>
        <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">For Homeowners &amp; Clients</h2>
        <div className="mx-auto mt-6 grid max-w-4xl gap-6 md:grid-cols-3">
          <PlanCard
            name="Free Trial"
            price="$0"
            period="/ 1 day"
            description="Try the platform risk-free. Post one request and see bids come in."
            features={[
              '1-day full access',
              'Post 1 service request',
              'Receive bids from vetted contractors',
              'Secure contact reveal after award',
            ]}
            cta="Start free trial"
            ctaHref="/register?role=CLIENT"
            isCurrent={activePlan === 'client-trial'}
            disabled={hasAnySub && activePlan !== 'client-trial'}
          />
          <PlanCard
            name="Starter"
            price="$5"
            period="/ month"
            description="Perfect for occasional home improvement projects."
            features={[
              'Up to 10 requests per month',
              'All service categories',
              'Receive unlimited bids',
              'Secure messaging with contractors',
              'Contact reveal after award',
            ]}
            cta="Get Starter"
            ctaHref={session?.user ? '/dashboard/client/billing' : '/register?role=CLIENT'}
            isCurrent={activePlan === 'client-starter'}
          />
          <PlanCard
            name="Pro"
            price="$10"
            period="/ month"
            description="For landlords, property managers, and power users."
            badge="Best value"
            features={[
              'Up to 100 requests per month',
              'All service categories',
              'Receive unlimited bids',
              'Secure messaging with contractors',
              'Contact reveal after award',
              'Priority support',
            ]}
            cta="Get Pro"
            ctaHref={session?.user ? '/dashboard/client/billing' : '/register?role=CLIENT'}
            highlighted
            isCurrent={activePlan === 'client-pro'}
          />
        </div>
      </section>

      {/* Contractor plan */}
      <section>
        <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">For Contractors</h2>
        <div className="mx-auto mt-6 max-w-sm">
          <PlanCard
            name="Contractor Pro"
            price="$10"
            period="/ month"
            description="One flat rate to access every open job in Ohio. No per-lead fees."
            features={[
              'Unlimited bids per month',
              'Browse all open requests',
              'ZIP-code proximity search',
              'Direct messaging with clients',
              'Verified contractor badge',
              'Build your reputation with ratings',
            ]}
            cta="Join as Contractor"
            ctaHref={session?.user ? '/dashboard/contractor/billing' : '/register?role=CONTRACTOR'}
            isCurrent={activePlan === 'contractor-pro'}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl space-y-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">Common questions</h2>
        {[
          {
            q: 'How does the free trial work?',
            a: 'Sign up as a client and immediately post one request. Contractors can bid for 24 hours. No credit card required to start.'
          },
          {
            q: 'When is my contact info shared with a contractor?',
            a: 'Never publicly. Your phone and email are only revealed to the single contractor you choose to award the job to.'
          },
          {
            q: 'Do contractors pay per bid?',
            a: 'No — contractors pay a flat $10/month subscription and can bid on as many jobs as they like.'
          },
          {
            q: 'Is this only for Ohio?',
            a: "Yes, for now. We're focused on building the best local marketplace for Ohio homeowners and contractors before expanding."
          },
        ].map(({ q, a }) => (
          <div key={q} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="font-semibold text-slate-900">{q}</p>
            <p className="mt-1.5 text-sm text-slate-500">{a}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
