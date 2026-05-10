import Link from 'next/link';
import { awardBidAction } from '@/app/actions/request-actions';
import { Button, Card, StatusBadge, UrgencyBadge, Alert, Badge } from '@/components/ui';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export default async function ClientRequestDetail({ params }: { params: { id: string } }) {
  const session = await requireRole(['CLIENT']);
  const req = await prisma.request.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      bids: {
        include: {
          contractor: { include: { contractorProfile: true, profile: true } },
          conversation: true
        },
        orderBy: { amount: 'asc' }
      }
    }
  });

  if (!req || req.clientId !== session.user.id) {
    return <Card><p className="text-slate-500">Request not found.</p></Card>;
  }

  const winnerBid = req.bids.find((b) => b.id === req.awardedBidId);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Breadcrumb */}
      <Link href="/dashboard/client/requests" className="text-sm text-brand-600 hover:underline">
        ← My Requests
      </Link>

      {/* Request card */}
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

        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{req.description}</p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          {req.budget && <span>Budget: <strong className="text-slate-900">${req.budget}</strong></span>}
          {req.preferredDate && <span>Preferred date: <strong className="text-slate-900">{new Date(req.preferredDate).toLocaleDateString()}</strong></span>}
          <span>Posted: <strong className="text-slate-900">{new Date(req.createdAt).toLocaleDateString()}</strong></span>
        </div>

        {['OPEN', 'PENDING_MODERATION', 'DRAFT'].includes(req.status) && (
          <div className="mt-4 border-t pt-3">
            <Link href={`/dashboard/client/requests/${req.id}/edit`} className="text-sm text-brand-600 hover:underline">
              Edit request →
            </Link>
          </div>
        )}
      </Card>

      {req.status === 'PENDING_MODERATION' && (
        <Alert variant="warning">
          Your request is being reviewed by our moderation team and will be visible to contractors shortly.
        </Alert>
      )}

      {req.status === 'REJECTED' && req.rejectionReason && (
        <Alert variant="error">
          Request rejected: {req.rejectionReason}
        </Alert>
      )}

      {/* Winner banner */}
      {winnerBid && (
        <Alert variant="success">
          <strong>Awarded</strong> to {winnerBid.contractor.contractorProfile?.businessName ?? winnerBid.contractor.email}.
          The contractor has been notified with your contact details.
        </Alert>
      )}

      {/* Bids */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Incoming Bids{req.bids.length > 0 && <span className="ml-2 text-sm font-normal text-slate-400">({req.bids.length})</span>}
          </h2>
        </div>

        {req.bids.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No bids yet. Contractors will be notified when your request is open.
          </p>
        ) : (
          <div className="space-y-3">
            {req.bids.map((b) => {
              const isWinner = b.id === req.awardedBidId;
              const convId = b.conversation?.id;
              return (
                <div
                  key={b.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    isWinner ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {b.contractor.contractorProfile?.businessName ?? b.contractor.profile?.fullName ?? 'Contractor'}
                        </p>
                        {isWinner && <Badge variant="success">Winner</Badge>}
                        {!isWinner && <StatusBadge status={b.status} />}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">Timeline: {b.estimatedTimeline}</p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">${b.amount}</p>
                  </div>

                  <p className="mt-3 text-sm text-slate-700">{b.message}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {convId && (
                      <Link
                        href={`/dashboard/client/conversation/${convId}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Message
                      </Link>
                    )}
                    {req.status === 'OPEN' && b.status === 'SUBMITTED' && (
                      <form
                        action={async () => {
                          'use server';
                          await awardBidAction(req.id, b.id);
                        }}
                      >
                        <Button size="sm" type="submit">
                          Award this bid
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
