import Link from 'next/link';
import { Urgency } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Badge, Card } from '@/components/ui';

export default async function RequestsPage({
  searchParams
}: {
  searchParams: { q?: string; city?: string; category?: string; urgency?: string; min?: string; max?: string }
}) {
  const normalizedQuery = searchParams.q?.trim();
  const normalizedCity = searchParams.city?.trim();
  const normalizedMin = searchParams.min ? Number(searchParams.min) : undefined;
  const normalizedMax = searchParams.max ? Number(searchParams.max) : undefined;
  const validUrgency = Object.values(Urgency).includes(searchParams.urgency as Urgency)
    ? (searchParams.urgency as Urgency)
    : undefined;

  const requests = await prisma.request.findMany({
    where: {
      status: 'OPEN',
      moderationStatus: 'APPROVED',
      OR: normalizedQuery
        ? [
            { title: { contains: normalizedQuery, mode: 'insensitive' } },
            { description: { contains: normalizedQuery, mode: 'insensitive' } }
          ]
        : undefined,
      city: normalizedCity ? { contains: normalizedCity, mode: 'insensitive' } : undefined,
      urgency: validUrgency,
      category: searchParams.category ? { slug: searchParams.category } : undefined,
      budget:
        Number.isFinite(normalizedMin) || Number.isFinite(normalizedMax)
          ? {
              gte: Number.isFinite(normalizedMin) ? normalizedMin : undefined,
              lte: Number.isFinite(normalizedMax) ? normalizedMax : undefined
            }
          : undefined
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
      {(normalizedQuery || normalizedCity || searchParams.category || validUrgency || searchParams.min || searchParams.max) ? (
        <div>
          <Link href="/requests" className="text-sm text-slate-600 underline">
            Clear filters
          </Link>
        </div>
      ) : null}

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
