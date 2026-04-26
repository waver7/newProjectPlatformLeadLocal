import Link from 'next/link';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

export default async function AdminDashboard() {
  await requireRole(['ADMIN']);
  const [users, openRequests, bids, flagged, activeSubs] = await Promise.all([
    prisma.user.count(),
    prisma.request.count({ where: { status: 'OPEN' } }),
    prisma.bid.count(),
    prisma.moderationLog.count({ where: { status: { in: ['FLAGGED', 'REJECTED'] } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } })
  ]);
  return <div className="space-y-3"><h1 className="text-2xl font-bold">Admin Dashboard</h1><div className="grid md:grid-cols-5 gap-2">{[{k:'Users',v:users},{k:'Open requests',v:openRequests},{k:'Bids',v:bids},{k:'Flagged',v:flagged},{k:'Active subs',v:activeSubs}].map(i => <Card key={i.k}><p className="text-sm text-slate-600">{i.k}</p><p className="text-xl font-bold">{i.v}</p></Card>)}</div><Card><div className="flex gap-4 text-sm"><Link href="/dashboard/admin/users">Users</Link><Link href="/dashboard/admin/requests">Requests</Link><Link href="/dashboard/admin/bids">Bids</Link><Link href="/dashboard/admin/messages">Messages</Link><Link href="/dashboard/admin/moderation">Moderation</Link><Link href="/dashboard/admin/settings">Settings</Link></div></Card></div>;
}
