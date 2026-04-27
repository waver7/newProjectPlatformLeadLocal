import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';
import { PlaceBidForm } from './place-bid-form';

export default async function ContractorRequestDetail({ params }: { params: { id: string } }) {
  const session = await requireRole(['CONTRACTOR']);
  const req = await prisma.request.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      client: { include: { clientProfile: true } },
      bids: { where: { contractorId: session.user.id } }
    }
  });

  if (!req) return <Card>Request unavailable</Card>;

  const myBid = req.bids[0];
  const isWinningBid = !!myBid && req.awardedBidId === myBid.id;
  const shouldRevealClientContact = isWinningBid && req.status !== 'OPEN';

  return (
    <div className="space-y-3">
      <Card>
        <h1 className="text-xl font-bold">{req.title}</h1>
        <p>{req.description}</p>
        <p className="mt-2 text-sm">Status: {req.status}</p>
        {!shouldRevealClientContact ? <p className="text-sm">Client contact hidden until bid award.</p> : null}
      </Card>

      {req.status === 'OPEN' && !myBid ? (
        <Card>
          <h2 className="mb-2 font-semibold">Submit bid</h2>
          <PlaceBidForm requestId={req.id} />
        </Card>
      ) : null}

      {req.status === 'OPEN' && myBid ? <Card>You already bid on this request.</Card> : null}

      {shouldRevealClientContact ? (
        <Card>
          <h2 className="mb-2 font-semibold">You won this request 🎉</h2>
          <p className="text-sm">Contact details are now visible:</p>
          <p className="text-sm">Email: {req.client.clientProfile?.emailPrivate || req.client.email}</p>
          <p className="text-sm">Phone: {req.client.clientProfile?.phonePrivate || 'Not provided'}</p>
        </Card>
      ) : null}

      {req.status !== 'OPEN' && !isWinningBid ? <Card>This request has been awarded to another contractor.</Card> : null}
    </div>
  );
}
