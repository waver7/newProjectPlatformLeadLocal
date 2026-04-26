import Link from 'next/link';
import { createMockSubscription, hasActiveSubscription } from '@/lib/billing';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Button, Card } from '@/components/ui';

async function activateSub() {
  'use server';
  const { auth } = await import('@/auth');
  const session = await auth();
  if (!session?.user) return;
  await createMockSubscription(session.user.id);
}

export default async function ContractorDashboard() {
  const session = await requireRole(['CONTRACTOR']);
  const [activeSub, bids] = await Promise.all([
    hasActiveSubscription(session.user.id),
    prisma.bid.findMany({ where: { contractorId: session.user.id }, include: { request: true }, orderBy: { createdAt: 'desc' }, take: 5 })
  ]);
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Contractor Dashboard</h1><Card><p>Subscription: {activeSub ? 'Active' : 'Inactive'}</p>{!activeSub && <form action={activateSub}><Button type="submit" className="mt-2">Activate mock $20/month subscription</Button></form>}</Card><Card><Link className="underline" href="/dashboard/contractor/requests">Browse requests</Link></Card><Card>{bids.map((b)=> <p key={b.id} className="text-sm">{b.request.title} - {b.status}</p>)}</Card></div>;
}
