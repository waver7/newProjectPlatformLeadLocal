import Link from 'next/link';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

export default async function ContractorRequestsPage() {
  await requireRole(['CONTRACTOR']);
  const reqs = await prisma.request.findMany({ where: { status: 'OPEN', moderationStatus: 'APPROVED' }, include: { category: true }, orderBy: { createdAt: 'desc' } });
  return <div className="space-y-3">{reqs.map((r)=> <Card key={r.id}><Link href={`/dashboard/contractor/requests/${r.id}`} className="font-semibold underline">{r.title}</Link><p className="text-sm">{r.city} • {r.category.name}</p></Card>)}</div>;
}
