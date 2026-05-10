import Link from 'next/link';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, SectionHeader, StatusBadge, EmptyState } from '@/components/ui';

export default async function ContractorBidsPage() {
  const session = await requireRole(['CONTRACTOR']);
  const bids = await prisma.bid.findMany({
    where: { contractorId: session.user.id },
    include: {
      request: { include: { category: true, client: { include: { clientProfile: true } } } },
      conversation: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-4">
      <SectionHeader title="My Bids" subtitle={`${bids.length} bid${bids.length !== 1 ? 's' : ''} total`} />

      {bids.length === 0 ? (
        <EmptyState
          title="No bids yet"
          description="Browse open jobs and submit your first bid."
        />
      ) : (
        <div className="space-y-3">
          {bids.map((b) => {
            const awardedToMe = b.request.awardedBidId === b.id;
            const cp = b.request.client.clientProfile;
            const convId = b.conversation?.id;
            return (
              <Card key={b.id} className={`transition-colors ${awardedToMe ? 'border-emerald-300 bg-emerald-50' : 'hover:border-slate-300'}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link href={`/dashboard/contractor/requests/${b.request.id}`} className="font-semibold text-slate-900 hover:text-brand-600 hover:underline">
                      {b.request.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">{b.request.category.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">${b.amount}</span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{b.message}</p>

                {awardedToMe && cp && (
                  <div className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 text-xs">
                    <p className="font-semibold text-emerald-900">You won! Contact:</p>
                    <p className="text-emerald-800">{cp.emailPrivate} · {cp.phonePrivate}</p>
                  </div>
                )}

                {!awardedToMe && b.request.status !== 'OPEN' && b.status !== 'ACCEPTED' && (
                  <p className="mt-2 text-xs text-slate-400">Awarded to another contractor.</p>
                )}

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span>Timeline: {b.estimatedTimeline}</span>
                  <span>·</span>
                  <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                  {convId && (
                    <>
                      <span>·</span>
                      <Link href={`/dashboard/contractor/conversation/${convId}`} className="text-brand-600 hover:underline">
                        {awardedToMe ? 'Message client' : 'View conversation'}
                      </Link>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
