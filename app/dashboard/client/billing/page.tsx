import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { getActiveSubscription } from '@/lib/billing';
import { PLANS } from '@/lib/stripe';
import { createCheckoutSessionAction, openBillingPortalAction } from '@/app/actions/billing-actions';
import { Card, SectionHeader, Badge } from '@/components/ui';

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-brand-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export default async function ClientBillingPage({
  searchParams
}: {
  searchParams: { success?: string; canceled?: string; mock?: string }
}) {
  const session = await requireRole(['CLIENT']);
  const [activeSub, allSubs, clientProfile] = await Promise.all([
    getActiveSubscription(session.user.id),
    prisma.subscription.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.clientProfile.findUnique({ where: { userId: session.user.id } })
  ]);

  const starterPlan = PLANS['client-starter'];
  const proPlan = PLANS['client-pro'];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionHeader title="Billing & Subscription" subtitle="Manage your posting plan" />

      {searchParams.success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Payment successful! Your plan is now active.
        </div>
      )}
      {searchParams.canceled && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment canceled — your plan was not changed.
        </div>
      )}
      {searchParams.mock && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Running in demo mode — subscription activated without real payment.
        </div>
      )}

      {/* Current status */}
      <Card>
        <h2 className="mb-3 font-semibold text-slate-900">Current Plan</h2>
        {activeSub ? (
          <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
            <div>
              <p className="font-semibold text-brand-900">
                {PLANS[activeSub.planCode as keyof typeof PLANS]?.label ?? activeSub.planCode}
              </p>
              <p className="text-sm text-brand-700">
                {activeSub.amountCents === 0
                  ? 'Free trial'
                  : `$${(activeSub.amountCents / 100).toFixed(0)}/month`}
              </p>
            </div>
            <div className="text-right">
              <Badge variant={activeSub.status === 'TRIALING' ? 'warning' : 'success'}>
                {activeSub.status === 'TRIALING' ? 'Trial' : 'Active'}
              </Badge>
              <p className="mt-1 text-xs text-slate-500">
                {activeSub.status === 'TRIALING' ? 'Expires' : 'Renews'}{' '}
                {new Date(activeSub.endsAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center text-sm text-slate-500">
            No active plan — choose one below to keep posting.
          </div>
        )}

        {/* Manage via portal (Stripe only) */}
        {activeSub?.provider === 'stripe' && (
          <form action={openBillingPortalAction} className="mt-3">
            <button className="text-sm text-brand-600 hover:underline">
              Manage subscription / invoices →
            </button>
          </form>
        )}
      </Card>

      {/* Available plans */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Starter */}
        <Card className={activeSub?.planCode === 'client-starter' ? 'border-brand-400' : ''}>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Starter</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">$5<span className="text-base font-normal text-slate-400">/mo</span></p>
          <p className="mt-1 text-sm text-slate-500">{starterPlan.description}</p>
          <ul className="mt-4 space-y-2">
            {['10 requests per month', 'Unlimited bids received', 'All categories', 'Contact reveal after award'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckIcon />{f}
              </li>
            ))}
          </ul>
          <form action={createCheckoutSessionAction.bind(null, 'client-starter')} className="mt-5">
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              disabled={activeSub?.planCode === 'client-starter'}
            >
              {activeSub?.planCode === 'client-starter' ? 'Current plan' : 'Get Starter'}
            </button>
          </form>
        </Card>

        {/* Pro */}
        <Card className={`relative ${activeSub?.planCode === 'client-pro' ? 'border-brand-400' : 'border-brand-300'}`}>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-amber-900">Best value</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Pro</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">$10<span className="text-base font-normal text-slate-400">/mo</span></p>
          <p className="mt-1 text-sm text-slate-500">{proPlan.description}</p>
          <ul className="mt-4 space-y-2">
            {['100 requests per month', 'Unlimited bids received', 'All categories', 'Contact reveal after award', 'Priority support'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckIcon />{f}
              </li>
            ))}
          </ul>
          <form action={createCheckoutSessionAction.bind(null, 'client-pro')} className="mt-5">
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              disabled={activeSub?.planCode === 'client-pro'}
            >
              {activeSub?.planCode === 'client-pro' ? 'Current plan' : 'Get Pro'}
            </button>
          </form>
        </Card>
      </div>

      {/* Subscription history */}
      {allSubs.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-900">Billing History</h2>
          <div className="divide-y">
            {allSubs.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {PLANS[s.planCode as keyof typeof PLANS]?.label ?? s.planCode}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(s.startsAt).toLocaleDateString()} – {new Date(s.endsAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {s.amountCents === 0 ? 'Free' : `$${(s.amountCents / 100).toFixed(2)}`}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    s.status === 'TRIALING' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="text-center text-xs text-slate-400">
        Payments are processed securely by Stripe. We never store card details.
      </p>
    </div>
  );
}
