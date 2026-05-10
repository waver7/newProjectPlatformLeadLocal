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

export default async function ContractorBillingPage({
  searchParams
}: {
  searchParams: { success?: string; canceled?: string; mock?: string }
}) {
  const session = await requireRole(['CONTRACTOR']);
  const [activeSub, allSubs] = await Promise.all([
    getActiveSubscription(session.user.id),
    prisma.subscription.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const plan = PLANS['contractor-pro'];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SectionHeader title="Billing" subtitle="Manage your subscription and payment history" />

      {searchParams.success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Payment successful! Your Contractor Pro subscription is now active.
        </div>
      )}
      {searchParams.canceled && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment canceled — your subscription was not changed.
        </div>
      )}
      {searchParams.mock && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Running in demo mode — subscription activated without real payment.
        </div>
      )}

      {/* Current plan */}
      <Card>
        <h2 className="mb-3 font-semibold text-slate-900">Current Plan</h2>
        {activeSub ? (
          <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
            <div>
              <p className="font-semibold text-brand-900">
                {PLANS[activeSub.planCode as keyof typeof PLANS]?.label ?? activeSub.planCode}
              </p>
              <p className="text-sm text-brand-700">${(activeSub.amountCents / 100).toFixed(0)}/month</p>
            </div>
            <div className="text-right">
              <Badge variant="success">Active</Badge>
              <p className="mt-1 text-xs text-slate-500">Renews {new Date(activeSub.endsAt).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center">
            <p className="font-medium text-slate-700">No active subscription</p>
            <p className="mt-1 text-sm text-slate-500">Subscribe below to start bidding on jobs.</p>
          </div>
        )}

        {activeSub?.provider === 'stripe' && (
          <form action={openBillingPortalAction} className="mt-3">
            <button className="text-sm text-brand-600 hover:underline">
              Manage subscription / view invoices →
            </button>
          </form>
        )}
      </Card>

      {/* Subscribe / upgrade */}
      {!activeSub && (
        <Card className="border-brand-300">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Contractor Pro</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">$10<span className="text-base font-normal text-slate-400">/mo</span></p>
          <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
          <ul className="mt-4 space-y-2">
            {[
              'Unlimited bids per month',
              'Browse all open requests across Ohio',
              'ZIP-code proximity search',
              'Direct messaging with clients',
              'Verified contractor badge',
              'Build your reputation with client ratings',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckIcon />{f}
              </li>
            ))}
          </ul>
          <form action={createCheckoutSessionAction.bind(null, 'contractor-pro')} className="mt-5">
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Subscribe — $10/month
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-slate-400">Payments processed securely by Stripe. Cancel any time.</p>
        </Card>
      )}

      {/* History */}
      {allSubs.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-900">Subscription History</h2>
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
                  <span className="text-sm font-medium text-slate-700">${(s.amountCents / 100).toFixed(2)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
