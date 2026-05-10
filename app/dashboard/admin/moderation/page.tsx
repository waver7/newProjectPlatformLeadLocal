import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, SectionHeader, StatusBadge, Badge } from '@/components/ui';

const targetColors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger' | 'purple'> = {
  REQUEST: 'info',
  BID: 'purple',
  MESSAGE: 'warning',
  PROFILE: 'default'
};

export default async function AdminModeration() {
  await requireRole(['ADMIN']);
  const logs = await prisma.moderationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { actorUser: { include: { profile: true } } }
  });

  return (
    <div className="space-y-4">
      <SectionHeader title="Moderation Log" subtitle={`${logs.length} recent events`} />

      <div className="space-y-2">
        {logs.map((l) => (
          <Card key={l.id} className={`transition-colors ${l.status === 'REJECTED' ? 'border-red-200 bg-red-50' : l.status === 'FLAGGED' ? 'border-amber-200 bg-amber-50' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={targetColors[l.targetType] ?? 'default'}>{l.targetType}</Badge>
                <StatusBadge status={l.status} />
                {l.actorUser && (
                  <span className="text-xs text-slate-500">by {l.actorUser.profile?.fullName ?? l.actorUser.email}</span>
                )}
              </div>
              <span className="text-xs text-slate-400">{new Date(l.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-1 text-sm text-slate-700">{l.reason}</p>
          </Card>
        ))}
        {logs.length === 0 && <Card><p className="text-center text-sm text-slate-500">No moderation events yet.</p></Card>}
      </div>
    </div>
  );
}
