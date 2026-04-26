import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

export default async function AdminBids() {
  await requireRole(['ADMIN']);
  const bids = await prisma.bid.findMany({ include: { request: true, contractor: true }, orderBy: { createdAt: 'desc' } });
  return <div className="space-y-2">{bids.map((b)=><Card key={b.id}><p>{b.request.title}</p><p className="text-sm">{b.contractor.email} • {b.status} • ${b.amount}</p></Card>)}</div>;
}
