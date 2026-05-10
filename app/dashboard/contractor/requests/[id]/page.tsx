import Link from 'next/link';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, Alert, StatusBadge, UrgencyBadge, LinkButton } from '@/components/ui';
import { PlaceBidForm } from './place-bid-form';

export default async function ContractorRequestDetail({ params }: { params: { id: string } }) {
  const session = await requireRole(['CONTRACTOR']);
  const req = await prisma.request.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      client: { include: { clientProfile: true, profile: true } },
      bids: {
        where: { contractorId: session.user.id },
        include: { conversation: true }
      },
      _count: { select: { bids: true } }
    }
  });

  if (!req) return <Card><p className="text-slate-500">Request unavailable.</p></Card>;

  const myBid = req.bids[0];
  const isWinningBid = !!myBid && req.awardedBidId === myBid.id;
  const convId = myBid?.conversation?.id;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/dashboard/contractor/requests" className="text-sm text-brand-600 hover:underline">
        ← Browse Jobs
      </Link>

      {/* Request detail */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{req.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{req.category.name} · {req.city}</p>
          </div>
          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={req.urgency} />
            <StatusBadge status={req.status} />
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{req.description}</p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          {req.budget && <span>Client budget: <strong className="text-slate-900">${req.budget}</strong></span>}
          {req.preferredDate && <span>Preferred date: <strong className="text-slate-900">{new Date(req.preferredDate).toLocaleDateString()}</strong></span>}
          <span>Total bids: <strong className="text-slate-900">{req._count.bids}</strong></span>
        </div>

        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Client contact details are only revealed to the winning contractor after award.
        </p>
      </Card>

      {/* Won state */}
      {isWinningBid && (
        <Alert variant="success">
          <strong>You won this request!</strong> Contact the client to get started.
          <div className="mt-1 space-y-0.5 text-sm">
            <p><span className="font-medium">Email:</span> {req.client.clientProfile?.emailPrivate ?? req.client.email}</p>
            {req.client.clientProfile?.phonePrivate && (
              <p><span className="font-medium">Phone:</span> {req.client.clientProfile.phonePrivate}</p>
            )}
          </div>
          {convId && (
            <div className="mt-2">
              <LinkButton href={`/dashboard/contractor/conversation/${convId}`} size="sm">
                Open Message Thread →
              </LinkButton>
            </div>
          )}
        </Alert>
      )}

      {/* Already bid */}
      {myBid && !isWinningBid && (
        <Card>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">Your bid</p>
              <p className="mt-0.5 text-sm text-slate-500">Timeline: {myBid.estimatedTimeline}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">${myBid.amount}</p>
              <StatusBadge status={myBid.status} />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-700">{myBid.message}</p>
          {convId && (
            <div className="mt-3">
              <Link href={`/dashboard/contractor/conversation/${convId}`} className="text-sm text-brand-600 hover:underline">
                Message the client →
              </Link>
            </div>
          )}
          {req.status !== 'OPEN' && (
            <p className="mt-3 text-sm text-slate-500">This request has been awarded to another contractor.</p>
          )}
        </Card>
      )}

      {/* Place bid form */}
      {req.status === 'OPEN' && !myBid && (
        <Card>
          <h2 className="mb-4 font-semibold text-slate-900">Place Your Bid</h2>
          <PlaceBidForm requestId={req.id} />
        </Card>
      )}
    </div>
  );
}
