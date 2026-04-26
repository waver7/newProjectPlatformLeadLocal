import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Badge, Card } from '@/components/ui';

export default async function RequestsPage({ searchParams }: { searchParams: { q?: string; city?: string; category?: string } }) {
  const requests = await prisma.request.findMany({
    where: {
      status: 'OPEN',
      moderationStatus: 'APPROVED',
      title: searchParams.q ? { contains: searchParams.q, mode: 'insensitive' } : undefined,
      city: searchParams.city ? { equals: searchParams.city, mode: 'insensitive' } : undefined,
      category: searchParams.category ? { slug: searchParams.category } : undefined
    },
    include: { category: true }, orderBy: { createdAt: 'desc' }
  });
  return <div className="space-y-3">{requests.map((r) => <Card key={r.id}><div className="flex items-center justify-between"><div><Link href={`/requests/${r.id}`} className="font-semibold">{r.title}</Link><p className="text-sm text-slate-600">{r.city} • {r.category.name}</p></div><Badge>{r.urgency}</Badge></div></Card>)}</div>;
}
