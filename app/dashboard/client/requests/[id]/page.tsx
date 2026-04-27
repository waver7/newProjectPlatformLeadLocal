import Link from 'next/link';
import { awardBidAction } from '@/app/actions/request-actions';
import { Button, Card } from '@/components/ui';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export default async function ClientRequestDetail({ params }: { params: { id: string } }) {
  const session = await requireRole(['CLIENT']);
  const req = await prisma.request.findUnique({
    where: { id: params.id },
    include: { bids: { include: { contractor: { include: { contractorProfile: true } } } }, category: true }
  });
  if (!req || req.clientId !== session.user.id) return <Card>Not found</Card>;

  return (
    <div className="space-y-3">
      <Card>
        <h1 className="text-xl font-bold">{req.title}</h1>
        <p>
          {req.category.name} • {req.status}
        </p>
        <Link href={`/dashboard/client/requests/${req.id}/edit`} className="text-sm underline">
          Edit request
        </Link>
        {req.status === 'AWARDED' ? (
          <p className="mt-2 text-sm text-emerald-700">
            Award logic: one bid is accepted, all others become rejected, and only the winner gets your contact details.
          </p>
        ) : null}
      </Card>
      <Card>
        <h2 className="mb-2 font-semibold">Incoming bids</h2>
        {req.bids.length === 0 && <p className="text-sm">No bids yet.</p>}
        {req.bids.map((b) => (
          <div key={b.id} className="mb-2 rounded border p-3">
            <p className="font-medium">{b.contractor.contractorProfile?.businessName}</p>
            <p>
              ${b.amount} • {b.estimatedTimeline}
            </p>
            <p className="text-sm">{b.message}</p>
            <p className="mt-1 text-xs">Bid status: {b.status}</p>
            {req.status === 'OPEN' ? (
              <form
                action={async () => {
                  'use server';
                  await awardBidAction(req.id, b.id);
                }}
              >
                <Button className="mt-2" type="submit">
                  Accept bid
                </Button>
              </form>
            ) : null}
          </div>
        ))}
      </Card>
    </div>
  );
}
