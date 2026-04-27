import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Badge, Card, LinkButton } from '@/components/ui';

export default async function HomePage() {
  const [categories, session, recentRequests] = await Promise.all([
    prisma.category.findMany({ take: 8, where: { isActive: true } }),
    auth(),
    prisma.request.findMany({
      where: { status: 'OPEN', moderationStatus: 'APPROVED' },
      include: { category: true, _count: { select: { bids: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
  ]);

  const postRequestHref = session?.user
    ? session.user.role === 'CLIENT'
      ? '/dashboard/client/requests/new'
      : session.user.role === 'ADMIN'
        ? '/dashboard/admin/requests'
        : '/dashboard/contractor/requests'
    : '/register';

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border bg-white p-8">
        <h1 className="text-4xl font-bold">Find trusted local help for any job</h1>
        <p className="mt-3 text-slate-600">Post a task, compare offers, and choose the right local professional.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href={postRequestHref}>Post a Request</LinkButton>
          <Link href="/requests" className="rounded-md border px-4 py-2">
            Find Jobs
          </Link>
        </div>
        <form action="/requests" className="mt-6 grid gap-2 md:grid-cols-3">
          <input name="q" className="rounded-md border p-2" placeholder="What do you need?" />
          <input name="city" className="rounded-md border p-2" placeholder="City or ZIP" />
          <button className="rounded-md bg-slate-900 px-4 py-2 text-white">Search tasks</button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Popular categories</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((c) => (
            <Card key={c.id}>
              <p className="font-medium">{c.name}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">How it works</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {['Post your task', 'Get offers from local pros', 'Choose the best contractor', 'Complete and leave a review'].map((s, i) => (
            <Card key={s}>
              <p className="text-xs text-slate-500">Step {i + 1}</p>
              <p className="mt-1 font-semibold">{s}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Recent requests</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {recentRequests.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link href={`/requests/${r.id}`} className="font-semibold underline">
                    {r.title}
                  </Link>
                  <p className="text-sm text-slate-600">{r.city} • {r.category.name}</p>
                </div>
                <Badge>{r.urgency}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{r._count.bids} bids</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6">
        <h3 className="text-xl font-semibold">Are you a contractor? Get local leads near you.</h3>
        <p className="mt-2 text-sm text-slate-600">Create your profile, browse jobs by city, and submit offers.</p>
        <Link href="/register" className="mt-4 inline-block rounded-md bg-brand-500 px-4 py-2 text-white">
          Join as Contractor
        </Link>
      </section>
    </div>
  );
}
