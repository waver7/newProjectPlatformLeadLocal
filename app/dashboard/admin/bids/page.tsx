import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, SectionHeader, StatusBadge } from '@/components/ui';

export default async function AdminBids() {
  await requireRole(['ADMIN']);
  const bids = await prisma.bid.findMany({
    include: {
      request: { include: { category: true } },
      contractor: { include: { profile: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const flaggedBids = bids.filter((b) => b.status === 'FLAGGED' || b.moderationStatus === 'FLAGGED');

  return (
    <div className="space-y-4">
      <SectionHeader title="Bids" subtitle={`${flaggedBids.length} flagged · ${bids.length} total`} />

      {flaggedBids.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-amber-700">Flagged Bids</p>
          {flaggedBids.map((b) => (
            <Card key={b.id} className="border-amber-200 bg-amber-50">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{b.request.title}</p>
                  <p className="text-sm text-slate-600">{b.contractor.profile?.fullName ?? b.contractor.email}</p>
                  <p className="mt-2 text-sm text-slate-700 line-clamp-2">{b.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">${b.amount}</span>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500">All Bids</p>
        {bids.map((b) => (
          <Card key={b.id} className="hover:border-slate-300 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">{b.request.title}</p>
                <p className="text-xs text-slate-500">{b.contractor.profile?.fullName ?? b.contractor.email} · {b.request.category.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-900">${b.amount}</span>
                <StatusBadge status={b.status} />
                <span className="text-xs text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
