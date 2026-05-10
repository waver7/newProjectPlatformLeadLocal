import Link from 'next/link';
import { createMockSubscription, hasActiveSubscription } from '@/lib/billing';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Button, Card, LinkButton, SectionHeader, StatusBadge, Alert, EmptyState, Stat } from '@/components/ui';

async function activateSub() {
  'use server';
  const { auth } = await import('@/auth');
  const session = await auth();
  if (!session?.user) return;
  await createMockSubscription(session.user.id);
}

export default async function ContractorDashboard() {
  const session = await requireRole(['CONTRACTOR']);
  const [activeSub, bids, notifications, profile] = await Promise.all([
    hasActiveSubscription(session.user.id),
    prisma.bid.findMany({
      where: { contractorId: session.user.id },
      include: { request: { include: { category: true, client: { include: { clientProfile: true } } } }, conversation: true },
      orderBy: { createdAt: 'desc' },
      take: 6
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 3
    }),
    prisma.contractorProfile.findUnique({ where: { userId: session.user.id } })
  ]);

  const wonCount = bids.filter((b) => b.request.awardedBidId === b.id).length;
  const submittedCount = bids.filter((b) => b.status === 'SUBMITTED').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Contractor Dashboard"
        subtitle={profile?.businessName}
        action={<LinkButton href="/dashboard/contractor/requests">Browse Jobs</LinkButton>}
      />

      {/* Subscription banner */}
      {!activeSub && (
        <Alert variant="warning">
          <div className="flex items-center justify-between gap-4">
            <span>You need an active subscription to place bids on requests.</span>
            <form action={activateSub}>
              <Button type="submit" size="sm">Activate (mock $20/mo)</Button>
            </form>
          </div>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total Bids" value={bids.length} />
        <Stat label="Pending" value={submittedCount} />
        <Stat label="Won" value={wonCount} />
        <Stat label="Subscription" value={activeSub ? 'Active' : 'Inactive'} sub={activeSub ? 'Pro plan' : 'Upgrade needed'} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent bids */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Bids</h2>
            <Link href="/dashboard/contractor/bids" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>

          {bids.length === 0 ? (
            <EmptyState
              title="No bids yet"
              description="Browse open requests in your area and start bidding."
              action={<LinkButton href="/dashboard/contractor/requests">Find Jobs</LinkButton>}
            />
          ) : (
            <div className="space-y-2">
              {bids.map((b) => {
                const awardedToMe = b.request.awardedBidId === b.id;
                const cp = b.request.client.clientProfile;
                const convId = b.conversation?.id;
                return (
                  <Card key={b.id} className={`transition-colors ${awardedToMe ? 'border-emerald-300 bg-emerald-50' : 'hover:border-slate-300'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Link href={`/dashboard/contractor/requests/${b.request.id}`} className="font-medium text-slate-900 hover:text-brand-600 hover:underline">
                          {b.request.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500">{b.request.category.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">${b.amount}</span>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>

                    {awardedToMe && cp && (
                      <div className="mt-2 rounded-lg bg-emerald-100 px-3 py-2 text-xs">
                        <span className="font-medium text-emerald-900">Client: </span>
                        <span className="text-emerald-800">{cp.emailPrivate} · {cp.phonePrivate}</span>
                      </div>
                    )}

                    {convId && (
                      <div className="mt-2">
                        <Link
                          href={`/dashboard/contractor/conversation/${convId}`}
                          className="text-xs text-brand-600 hover:underline"
                        >
                          {awardedToMe ? 'Message client →' : 'View conversation →'}
                        </Link>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Quick links */}
          <Card>
            <h2 className="mb-3 font-semibold text-slate-900">Quick Links</h2>
            <div className="space-y-1.5">
              {[
                { href: '/dashboard/contractor/requests', label: 'Browse open jobs' },
                { href: '/dashboard/contractor/bids', label: 'All my bids' },
                { href: '/dashboard/contractor/profile', label: 'Edit profile' },
                { href: '/dashboard/contractor/billing', label: 'Billing' }
              ].map((l) => (
                <Link key={l.href} href={l.href} className="block rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600">
                  {l.label} →
                </Link>
              ))}
            </div>
          </Card>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-semibold text-slate-900">Notifications</h2>
              {notifications.map((n) => (
                <Card key={n.id} className="border-l-4 border-l-brand-500">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.body}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
