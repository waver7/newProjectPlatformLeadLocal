import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, SectionHeader, StatusBadge, Badge } from '@/components/ui';

export default async function ContractorBillingPage() {
  const session = await requireRole(['CONTRACTOR']);
  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  const activeSub = subs.find((s) => s.status === 'ACTIVE' && s.endsAt > new Date());

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <SectionHeader title="Billing" subtitle="Manage your subscription and payment history" />

      {/* Current plan */}
      <Card>
        <h2 className="mb-3 font-semibold text-slate-900">Current Plan</h2>
        {activeSub ? (
          <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
            <div>
              <p className="font-semibold text-brand-900">{activeSub.planCode}</p>
              <p className="text-sm text-brand-700">${(activeSub.amountCents / 100).toFixed(2)}/month</p>
            </div>
            <div className="text-right">
              <Badge variant="success">Active</Badge>
              <p className="mt-1 text-xs text-slate-500">Renews {new Date(activeSub.endsAt).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center">
            <p className="font-medium text-slate-700">No active subscription</p>
            <p className="mt-1 text-sm text-slate-500">
              An active subscription is required to place bids. Go to your{' '}
              <a href="/dashboard/contractor" className="text-brand-600 hover:underline">dashboard</a>{' '}
              to activate the mock plan.
            </p>
          </div>
        )}
      </Card>

      {/* History */}
      {subs.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-900">Subscription History</h2>
          <div className="divide-y">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{s.planCode}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(s.startsAt).toLocaleDateString()} – {new Date(s.endsAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">${(s.amountCents / 100).toFixed(2)}</span>
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="text-center text-xs text-slate-400">
        Payment processing is in mock mode. Real Stripe integration can be added at any time.
      </p>
    </div>
  );
}
