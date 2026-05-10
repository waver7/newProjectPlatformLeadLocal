import Link from 'next/link';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, SectionHeader, StatusBadge, UrgencyBadge, EmptyState, Badge } from '@/components/ui';

export default async function ContractorRequestsPage() {
  const session = await requireRole(['CONTRACTOR']);

  const [reqs, myBidIds] = await Promise.all([
    prisma.request.findMany({
      where: { status: 'OPEN', moderationStatus: 'APPROVED' },
      include: { category: true, _count: { select: { bids: true } } },
      orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }]
    }),
    prisma.bid.findMany({
      where: { contractorId: session.user.id },
      select: { requestId: true }
    })
  ]);

  const myBidRequestIds = new Set(myBidIds.map((b) => b.requestId));

  const urgencyOrder: Record<string, number> = { EMERGENCY: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sorted = [...reqs].sort((a, b) => (urgencyOrder[a.urgency] ?? 4) - (urgencyOrder[b.urgency] ?? 4));

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Open Jobs"
        subtitle={`${reqs.length} request${reqs.length !== 1 ? 's' : ''} available in your area`}
      />

      {reqs.length === 0 ? (
        <EmptyState
          title="No open jobs right now"
          description="Check back soon — new requests are posted daily."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => {
            const alreadyBid = myBidRequestIds.has(r.id);
            return (
              <Card key={r.id} className="hover:border-slate-300 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/contractor/requests/${r.id}`}
                        className="font-semibold text-slate-900 hover:text-brand-600 hover:underline"
                      >
                        {r.title}
                      </Link>
                      {alreadyBid && <Badge variant="success">Bid placed</Badge>}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">{r.city} · {r.category.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <UrgencyBadge urgency={r.urgency} />
                    <StatusBadge status={r.status} />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span>{r._count.bids} bid{r._count.bids !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
