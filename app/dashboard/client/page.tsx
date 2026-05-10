import Link from 'next/link';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, LinkButton, SectionHeader, StatusBadge, EmptyState, Stat } from '@/components/ui';

export default async function ClientDashboard() {
  const session = await requireRole(['CLIENT']);
  const [requests, notifications, profile] = await Promise.all([
    prisma.request.findMany({
      where: { clientId: session.user.id },
      include: { category: true, _count: { select: { bids: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.clientProfile.findUnique({ where: { userId: session.user.id } })
  ]);

  const openCount = requests.filter((r) => r.status === 'OPEN').length;
  const awardedCount = requests.filter((r) => r.status === 'AWARDED').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Client Dashboard"
        subtitle="Manage your service requests and track bids"
        action={<LinkButton href="/dashboard/client/requests/new">+ Post Request</LinkButton>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total Requests" value={requests.length} />
        <Stat label="Open" value={openCount} />
        <Stat label="Awarded" value={awardedCount} />
        <Stat label="Posts Remaining" value={Math.max(0, (profile?.freePostsUsed ?? 0))} sub={`${profile?.freePostsUsed ?? 0} used`} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent Requests */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Requests</h2>
            <Link href="/dashboard/client/requests" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          {requests.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Post your first request and get bids from local contractors."
              action={<LinkButton href="/dashboard/client/requests/new">Post a Request</LinkButton>}
            />
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <Card key={r.id} className="hover:border-brand-200 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link href={`/dashboard/client/requests/${r.id}`} className="font-medium text-slate-900 hover:text-brand-600 hover:underline">
                        {r.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">{r.category.name}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>{r._count.bids} bid{r._count.bids !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-900">Notifications</h2>
          {notifications.length === 0 ? (
            <Card>
              <p className="py-4 text-center text-sm text-slate-500">All caught up!</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <Card key={n.id} className="border-l-4 border-l-brand-500">
                  <p className="text-sm font-medium text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
