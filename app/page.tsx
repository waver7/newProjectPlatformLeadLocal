import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, LinkButton, UrgencyBadge } from '@/components/ui';

const steps = [
  { icon: '📋', title: 'Post your task', desc: 'Describe what you need, set your budget, and go live in minutes.' },
  { icon: '💬', title: 'Get offers', desc: 'Local pros see your request and send competitive bids.' },
  { icon: '⭐', title: 'Pick the best', desc: 'Review profiles, compare bids, and award to your favourite.' },
  { icon: '✅', title: 'Get it done', desc: 'The contractor contacts you directly after award.' }
];

export default async function HomePage() {
  const [categories, session, recentRequests] = await Promise.all([
    prisma.category.findMany({ take: 8, where: { isActive: true }, orderBy: { name: 'asc' } }),
    auth(),
    prisma.request.findMany({
      where: { status: 'OPEN', moderationStatus: 'APPROVED' },
      include: { category: true, _count: { select: { bids: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
  ]);

  const postHref = session?.user
    ? session.user.role === 'CLIENT'
      ? '/dashboard/client/requests/new'
      : session.user.role === 'ADMIN'
        ? '/dashboard/admin/requests'
        : '/dashboard/contractor/requests'
    : '/register';

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-16 text-white">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Find trusted local help<br />for any job
          </h1>
          <p className="mt-4 text-lg text-brand-100">
            Post a task, compare offers, and choose the right local professional — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href={postHref} variant="secondary" size="lg">
              Post a Request
            </LinkButton>
            <Link href="/requests" className="inline-flex items-center rounded-lg border border-white/30 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10">
              Browse Jobs
            </Link>
          </div>
          <form action="/requests" className="mt-8 flex gap-2">
            <input name="q" className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40" placeholder="What do you need?" />
            <input name="city" className="w-36 rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40" placeholder="City" />
            <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50">Search</button>
          </form>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-brand-900/30 to-transparent" />
      </section>

      {/* Categories */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Popular Categories</h2>
          <Link href="/categories" className="text-sm text-brand-600 hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/requests?category=${c.slug}`}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-card transition-all hover:border-brand-300 hover:shadow-md"
            >
              <span className="font-medium text-slate-800 group-hover:text-brand-700">{c.name}</span>
              <span className="text-slate-400 group-hover:text-brand-500">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="mb-6 text-2xl font-bold text-slate-900">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <span className="absolute right-4 top-4 text-2xl opacity-20 select-none font-black text-slate-300">{i + 1}</span>
              <span className="text-2xl">{s.icon}</span>
              <p className="mt-2 font-semibold text-slate-900">{s.title}</p>
              <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent requests */}
      {recentRequests.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Recent Requests</h2>
            <Link href="/requests" className="text-sm text-brand-600 hover:underline">See all →</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {recentRequests.map((r) => (
              <Card key={r.id} className="hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link href={`/requests/${r.id}`} className="font-semibold text-slate-900 hover:text-brand-600 hover:underline">
                      {r.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500">{r.city} · {r.category.name}</p>
                  </div>
                  <UrgencyBadge urgency={r.urgency} />
                </div>
                <p className="mt-2 text-xs text-slate-400">{r._count.bids} bid{r._count.bids !== 1 ? 's' : ''}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Contractor CTA */}
      <section className="rounded-2xl border border-brand-100 bg-brand-50 px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-brand-900">Are you a local contractor?</h3>
            <p className="mt-2 text-sm text-brand-700">Create your free profile, browse jobs by city, and win more business.</p>
          </div>
          <LinkButton href="/register" size="lg">Join as Contractor</LinkButton>
        </div>
      </section>
    </div>
  );
}
