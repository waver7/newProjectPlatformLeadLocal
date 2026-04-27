import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Badge, Card } from '@/components/ui';

export default async function RequestsPage({
  searchParams
}: {
  searchParams: { q?: string; city?: string; category?: string; urgency?: string; min?: string; max?: string }
}) {
  const requests = await prisma.request.findMany({
    where: {
      status: 'OPEN',
      moderationStatus: 'APPROVED',
      title: searchParams.q ? { contains: searchParams.q, mode: 'insensitive' } : undefined,
      city: searchParams.city ? { contains: searchParams.city, mode: 'insensitive' } : undefined,
      urgency: searchParams.urgency as any,
      category: searchParams.category ? { slug: searchParams.category } : undefined,
      budget: searchParams.min || searchParams.max ? { gte: searchParams.min ? Number(searchParams.min) : undefined, lte: searchParams.max ? Number(searchParams.max) : undefined } : undefined
    },
    include: { category: true, _count: { select: { bids: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Open local requests</h1>
      <form className="grid gap-2 rounded-xl border bg-white p-3 md:grid-cols-6">
        <input name="q" defaultValue={searchParams.q} className="rounded border p-2" placeholder="Keyword" />
        <input name="city" defaultValue={searchParams.city} className="rounded border p-2" placeholder="City/ZIP" />
        <select name="category" defaultValue={searchParams.category} className="rounded border p-2">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select name="urgency" defaultValue={searchParams.urgency} className="rounded border p-2">
          <option value="">Any priority</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="EMERGENCY">URGENT</option>
        </select>
        <input name="min" type="number" defaultValue={searchParams.min} className="rounded border p-2" placeholder="Budget min" />
        <div className="flex gap-2">
          <input name="max" type="number" defaultValue={searchParams.max} className="w-full rounded border p-2" placeholder="Budget max" />
          <button className="rounded bg-slate-900 px-4 text-white">Filter</button>
        </div>
      </form>

      <div className="space-y-3">
        {requests.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/requests/${r.id}`} className="font-semibold underline">{r.title}</Link>
                <p className="text-sm text-slate-600">{r.city} • {r.category.name}</p>
                <p className="mt-1 text-xs text-slate-500">{r._count.bids} bids • {r.status}</p>
              </div>
              <Badge>{r.urgency}</Badge>
            </div>
          </Card>
        ))}
        {requests.length === 0 ? <Card>No matching requests yet.</Card> : null}
      </div>
    </div>
  );
}
