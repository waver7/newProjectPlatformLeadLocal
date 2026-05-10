import Link from 'next/link';
import { Urgency } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Card, UrgencyBadge, StatusBadge, EmptyState } from '@/components/ui';

export default async function RequestsPage({
  searchParams
}: {
  searchParams: { q?: string; city?: string; category?: string; urgency?: string; min?: string; max?: string }
}) {
  const q = searchParams.q?.trim();
  const city = searchParams.city?.trim();
  const minBudget = searchParams.min ? Number(searchParams.min) : undefined;
  const maxBudget = searchParams.max ? Number(searchParams.max) : undefined;
  const validUrgency = Object.values(Urgency).includes(searchParams.urgency as Urgency)
    ? (searchParams.urgency as Urgency)
    : undefined;
  const hasFilters = !!(q || city || searchParams.category || validUrgency || searchParams.min || searchParams.max);

  const [requests, categories] = await Promise.all([
    prisma.request.findMany({
      where: {
        status: 'OPEN',
        moderationStatus: 'APPROVED',
        OR: q ? [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ] : undefined,
        city: city ? { contains: city, mode: 'insensitive' } : undefined,
        urgency: validUrgency,
        category: searchParams.category ? { slug: searchParams.category } : undefined,
        budget: Number.isFinite(minBudget) || Number.isFinite(maxBudget) ? {
          gte: Number.isFinite(minBudget) ? minBudget : undefined,
          lte: Number.isFinite(maxBudget) ? maxBudget : undefined
        } : undefined
      },
      include: { category: true, _count: { select: { bids: true } } },
      orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }]
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Open Requests</h1>
        {hasFilters && (
          <Link href="/requests" className="text-sm text-brand-600 hover:underline">Clear filters</Link>
        )}
      </div>

      {/* Filter bar */}
      <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-6">
          <input name="q" defaultValue={searchParams.q} className="rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 md:col-span-2" placeholder="Keyword search…" />
          <input name="city" defaultValue={searchParams.city} className="rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="City or ZIP" />
          <select name="category" defaultValue={searchParams.category} className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select name="urgency" defaultValue={searchParams.urgency} className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
            <option value="">Any urgency</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Search
          </button>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input name="min" type="number" defaultValue={searchParams.min} className="rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Min budget ($)" />
          <input name="max" type="number" defaultValue={searchParams.max} className="rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Max budget ($)" />
        </div>
      </form>

      <p className="text-sm text-slate-500">{requests.length} request{requests.length !== 1 ? 's' : ''} found</p>

      {requests.length === 0 ? (
        <EmptyState
          title="No matching requests"
          description="Try adjusting your filters or check back later."
          action={<Link href="/requests" className="text-sm text-brand-600 hover:underline">Clear all filters</Link>}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id} className="hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Link href={`/requests/${r.id}`} className="font-semibold text-slate-900 hover:text-brand-600 hover:underline">
                    {r.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500">{r.city} · {r.category.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <UrgencyBadge urgency={r.urgency} />
                  <StatusBadge status={r.status} />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>{r._count.bids} bid{r._count.bids !== 1 ? 's' : ''}</span>
                {r.budget && <><span>·</span><span>Budget: ${r.budget}</span></>}
                <span>·</span>
                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
