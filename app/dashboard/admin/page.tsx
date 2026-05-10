import Link from 'next/link';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, Stat } from '@/components/ui';

export default async function AdminDashboard() {
  await requireRole(['ADMIN']);
  const [users, openRequests, pendingModeration, bids, flagged, activeSubs] = await Promise.all([
    prisma.user.count(),
    prisma.request.count({ where: { status: 'OPEN' } }),
    prisma.request.count({ where: { status: 'PENDING_MODERATION' } }),
    prisma.bid.count(),
    prisma.moderationLog.count({ where: { status: { in: ['FLAGGED', 'REJECTED'] } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } })
  ]);

  const navItems = [
    { href: '/dashboard/admin/users', label: 'Users', description: 'Manage accounts and permissions' },
    { href: '/dashboard/admin/requests', label: 'Requests', description: 'Review and moderate requests' },
    { href: '/dashboard/admin/bids', label: 'Bids', description: 'Monitor all contractor bids' },
    { href: '/dashboard/admin/messages', label: 'Messages', description: 'Review flagged messages' },
    { href: '/dashboard/admin/moderation', label: 'Moderation Log', description: 'Full moderation history' },
    { href: '/dashboard/admin/settings', label: 'Settings', description: 'Platform configuration' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Platform overview and management tools</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Users" value={users} />
        <Stat label="Open Requests" value={openRequests} />
        <Stat label="Pending Review" value={pendingModeration} sub={pendingModeration > 0 ? 'Needs attention' : 'All clear'} />
        <Stat label="Total Bids" value={bids} />
        <Stat label="Flagged" value={flagged} sub={flagged > 0 ? 'Review needed' : 'All clear'} />
        <Stat label="Active Subs" value={activeSubs} />
      </div>

      {pendingModeration > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-800">{pendingModeration}</span>
          <div>
            <p className="font-medium text-amber-900">Requests pending moderation</p>
            <Link href="/dashboard/admin/requests" className="text-sm text-amber-700 underline">Review now →</Link>
          </div>
        </div>
      )}

      {/* Nav grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full cursor-pointer transition-all hover:border-brand-300 hover:shadow-md">
              <p className="font-semibold text-slate-900">{item.label}</p>
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
