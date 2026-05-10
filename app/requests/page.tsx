import Link from 'next/link';
import { Urgency } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { distanceMiles, lookupZip } from '@/lib/geo';
import { Card, UrgencyBadge, StatusBadge, EmptyState } from '@/components/ui';

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default async function RequestsPage({
  searchParams
}: {
  searchParams: { q?: string; city?: string; category?: string; urgency?: string; min?: string; max?: string; zip?: string; radius?: string }
}) {
  const q = searchParams.q?.trim();
  const city = searchParams.city?.trim();
  const minBudget = searchParams.min ? Number(searchParams.min) : undefined;
  const maxBudget = searchParams.max ? Number(searchParams.max) : undefined;
  const validUrgency = Object.values(Urgency).includes(searchParams.urgency as Urgency)
    ? (searchParams.urgency as Urgency)
    : undefined;
  const zipParam = searchParams.zip?.trim();
  const radiusMiles = searchParams.radius ? Number(searchParams.radius) : 25;
  const searchCoords = zipParam ? lookupZip(zipParam) : null;
  const useGeoFilter = !!(searchCoords && radiusMiles > 0);

  const hasFilters = !!(q || city || searchParams.category || validUrgency || searchParams.min || searchParams.max || zipParam);

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

  // Apply geo filter in JS (Prisma doesn't support native geospatial queries)
  const filtered = useGeoFilter
    ? requests.filter((r) => {
        if (r.latitude == null || r.longitude == null) return false;
        return distanceMiles(searchCoords!, { lat: r.latitude, lon: r.longitude }) <= radiusMiles;
      })
    : requests;

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
          <input name="city" defaultValue={searchParams.city} className="rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="City" />
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

        {/* ZIP + radius row */}
        <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          <div className="relative">
            <input name="zip" defaultValue={searchParams.zip} maxLength={5} pattern="\d{5}" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="ZIP code" />
          </div>
          <select name="radius" defaultValue={searchParams.radius ?? '25'} className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
            <option value="5">Within 5 miles</option>
            <option value="10">Within 10 miles</option>
            <option value="25">Within 25 miles</option>
            <option value="50">Within 50 miles</option>
            <option value="100">Within 100 miles</option>
          </select>
          <input name="min" type="number" defaultValue={searchParams.min} className="rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Min budget ($)" />
          <input name="max" type="number" defaultValue={searchParams.max} className="rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Max budget ($)" />
        </div>

        {useGeoFilter && (
          <p className="mt-2 text-xs text-brand-700">
            Showing results within {radiusMiles} miles of ZIP {zipParam}
          </p>
        )}
        {zipParam && !searchCoords && (
          <p className="mt-2 text-xs text-amber-600">
            ZIP code {zipParam} not found in our Ohio database — showing all results.
          </p>
        )}
      </form>

      <p className="text-sm text-slate-500">{filtered.length} request{filtered.length !== 1 ? 's' : ''} found</p>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching requests"
          description="Try adjusting your filters or check back later."
          action={<Link href="/requests" className="text-sm text-brand-600 hover:underline">Clear all filters</Link>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} className="hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Link href={`/requests/${r.id}`} className="font-semibold text-slate-900 hover:text-brand-600 hover:underline">
                    {r.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500">{r.city}{r.state ? `, ${r.state}` : ''} · {r.category.name}</p>
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
                <span>Posted {timeAgo(new Date(r.createdAt))}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
