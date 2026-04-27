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
    prisma.bid.findMany({
      where: { contractorId: session.user.id },
      include: {
        request: {
          include: {
            client: { include: { clientProfile: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Contractor Dashboard</h1>
      <Card>
        <p>Subscription: {activeSub ? 'Active' : 'Inactive'}</p>
        {!activeSub && (
          <form action={activateSub}>
            <Button type="submit" className="mt-2">
              Activate mock $20/month subscription
            </Button>
          </form>
        )}
      </Card>
      <Card>
        <Link className="underline" href="/dashboard/contractor/requests">
          Browse requests
        </Link>
      </Card>
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Latest bids</h2>
          <Link href="/dashboard/contractor/bids" className="text-sm underline">
            View all bids
          </Link>
        </div>
        {bids.length === 0 ? <p className="text-sm text-slate-600">You have no bids yet.</p> : null}
        <div className="space-y-2">
          {bids.map((b) => {
            const awardedToMe = b.request.awardedBidId === b.id;
            const clientContact = b.request.client.clientProfile;
            return (
              <div key={b.id} className="rounded border p-3 text-sm">
                <p className="font-medium">{b.request.title}</p>
                <p className="text-slate-600">Bid status: {b.status}</p>
                {awardedToMe ? (
                  <p className="text-emerald-700">
                    Client contact: {clientContact?.phonePrivate || 'Phone not provided'} •{' '}
                    {clientContact?.emailPrivate || b.request.client.email}
                  </p>
                ) : (
                  <p className="text-slate-500">Client contact hidden until your bid is awarded.</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
