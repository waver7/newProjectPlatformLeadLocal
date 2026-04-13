import Link from 'next/link';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

export default async function ClientDashboard() {
  const session = await requireRole(['CLIENT']);
  const [requests, notifications] = await Promise.all([
    prisma.request.findMany({ where: { clientId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 5 })
  ]);
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Client Dashboard</h1><Card><Link href="/dashboard/client/requests/new" className="underline">Post new request</Link></Card><Card><h2 className="font-semibold mb-2">Recent requests</h2>{requests.map((r) => <p key={r.id}><Link className="underline" href={`/dashboard/client/requests/${r.id}`}>{r.title}</Link> ({r.status})</p>)}</Card><Card><h2 className="font-semibold mb-2">Notifications</h2>{notifications.map((n)=> <p key={n.id} className="text-sm">{n.title}</p>)}</Card></div>;
}
