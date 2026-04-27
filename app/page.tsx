import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, LinkButton } from '@/components/ui';

export default async function HomePage() {
  const [categories, session] = await Promise.all([
    prisma.category.findMany({ take: 8, where: { isActive: true } }),
    auth()
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
        <h1 className="text-4xl font-bold">Post anything you need. Get bids from local contractors.</h1>
        <p className="mt-3 text-slate-600">A trusted local-first marketplace for home and business services.</p>
        <div className="mt-6 flex gap-3">
          <LinkButton href={postRequestHref}>Post a Request</LinkButton>
          <Link href="/pricing" className="rounded-md border px-4 py-2">
            Join as Contractor
          </Link>
        </div>
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
      <section className="grid gap-3 md:grid-cols-3">
        {['Post for free', 'Receive bids', 'Award with confidence'].map((s) => (
          <Card key={s}>
            <h3 className="font-semibold">{s}</h3>
            <p className="mt-2 text-sm text-slate-600">Secure workflow with moderation and controlled contact reveal.</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
