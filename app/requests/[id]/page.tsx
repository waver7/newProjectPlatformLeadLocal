import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, UrgencyBadge, StatusBadge, LinkButton } from '@/components/ui';

export default async function RequestDetail({ params }: { params: { id: string } }) {
  const req = await prisma.request.findUnique({
    where: { id: params.id },
    include: { category: true, _count: { select: { bids: true } } }
  });
  if (!req || req.status !== 'OPEN') notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/requests" className="text-sm text-brand-600 hover:underline">← Back to requests</Link>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{req.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{req.city} · {req.category.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={req.urgency} />
            <StatusBadge status={req.status} />
          </div>
        </div>

        <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{req.description}</p>

        <div className="mt-5 flex flex-wrap gap-4 border-t pt-4 text-sm text-slate-500">
          {req.budget && <span>Budget: <strong className="text-slate-900">${req.budget}</strong></span>}
          {req.preferredDate && <span>Preferred date: <strong className="text-slate-900">{new Date(req.preferredDate).toLocaleDateString()}</strong></span>}
          <span>{req._count.bids} bid{req._count.bids !== 1 ? 's' : ''} received</span>
          <span>Posted {new Date(req.createdAt).toLocaleDateString()}</span>
        </div>
      </Card>

      <Card className="text-center">
        <p className="text-sm font-medium text-slate-700">Interested in this job?</p>
        <p className="mt-1 text-sm text-slate-500">Log in or create a contractor account to place your bid.</p>
        <div className="mt-4 flex justify-center gap-3">
          <LinkButton href="/login" variant="secondary">Log in</LinkButton>
          <LinkButton href="/register">Join & bid</LinkButton>
        </div>
        <p className="mt-3 text-xs text-slate-400">Client contact is only revealed to the winning contractor.</p>
      </Card>
    </div>
  );
}
