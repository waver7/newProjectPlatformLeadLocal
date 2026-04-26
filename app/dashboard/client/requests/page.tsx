import Link from 'next/link';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

export default async function ClientRequestsPage() {
  const session = await requireRole(['CLIENT']);
  const requests = await prisma.request.findMany({ where: { clientId: session.user.id }, include: { category: true }, orderBy: { createdAt: 'desc' } });
  return <div className="space-y-3">{requests.map((r)=><Card key={r.id}><Link className="font-semibold underline" href={`/dashboard/client/requests/${r.id}`}>{r.title}</Link><p className="text-sm">{r.category.name} • {r.status}</p></Card>)}</div>;
}
