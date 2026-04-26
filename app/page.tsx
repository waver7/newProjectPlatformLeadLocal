import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, LinkButton } from '@/components/ui';

export default async function HomePage() {
  const categories = await prisma.category.findMany({ take: 8, where: { isActive: true } });
  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-white p-8 border">
        <h1 className="text-4xl font-bold">Post anything you need. Get bids from local contractors.</h1>
        <p className="mt-3 text-slate-600">A trusted local-first marketplace for home and business services.</p>
        <div className="mt-6 flex gap-3"><LinkButton href="/register">Post a Request</LinkButton><Link href="/pricing" className="px-4 py-2 border rounded-md">Join as Contractor</Link></div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Popular categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{categories.map((c) => <Card key={c.id}><p className="font-medium">{c.name}</p></Card>)}</div>
      </section>
      <section className="grid md:grid-cols-3 gap-3">{['Post for free', 'Receive bids', 'Award with confidence'].map((s) => <Card key={s}><h3 className="font-semibold">{s}</h3><p className="text-sm text-slate-600 mt-2">Secure workflow with moderation and controlled contact reveal.</p></Card>)}</section>
    </div>
  );
}
