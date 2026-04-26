import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

export default async function AdminModeration() {
  await requireRole(['ADMIN']);
  const logs = await prisma.moderationLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return <div className="space-y-2">{logs.map((l)=><Card key={l.id}><p>{l.targetType} • {l.status}</p><p className="text-sm">{l.reason}</p></Card>)}</div>;
}
