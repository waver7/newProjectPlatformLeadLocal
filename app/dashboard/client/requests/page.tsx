import Link from 'next/link';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, LinkButton, SectionHeader, StatusBadge, UrgencyBadge, EmptyState } from '@/components/ui';

export default async function ClientRequestsPage() {
  const session = await requireRole(['CLIENT']);
  const requests = await prisma.request.findMany({
    where: { clientId: session.user.id },
    include: { category: true, _count: { select: { bids: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="My Requests"
        action={<LinkButton href="/dashboard/client/requests/new">+ Post Request</LinkButton>}
      />

      {requests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          description="Post your first request and receive bids from local contractors."
          action={<LinkButton href="/dashboard/client/requests/new">Post a Request</LinkButton>}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id} className="hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Link href={`/dashboard/client/requests/${r.id}`} className="font-semibold text-slate-900 hover:text-brand-600 hover:underline">
                    {r.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500">{r.category.name} · {r.city}</p>
                </div>
                <div className="flex items-center gap-2">
                  <UrgencyBadge urgency={r.urgency} />
                  <StatusBadge status={r.status} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                <span>{r._count.bids} bid{r._count.bids !== 1 ? 's' : ''}</span>
                <span>·</span>
                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                {r.budget && (
                  <>
                    <span>·</span>
                    <span>Budget: ${r.budget}</span>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
