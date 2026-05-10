import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, UrgencyBadge, StatusBadge, LinkButton } from '@/components/ui';

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

export default async function RequestDetail({ params }: { params: { id: string } }) {
  const [req, session] = await Promise.all([
    prisma.request.findUnique({
      where: { id: params.id },
      include: { category: true, _count: { select: { bids: true } } }
    }),
    auth()
  ]);

  if (!req || req.status !== 'OPEN') notFound();

  // Logged-in contractors go straight to their bidding page
  if (session?.user?.role === 'CONTRACTOR') {
    redirect(`/dashboard/contractor/requests/${req.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/requests" className="text-sm text-brand-600 hover:underline">← Back to requests</Link>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{req.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{req.city}{req.state ? `, ${req.state}` : ''} · {req.category.name}</p>
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
          <span>Posted {timeAgo(new Date(req.createdAt))}</span>
        </div>
      </Card>

      {/* Role-appropriate call-to-action */}
      {!session?.user && (
        <Card className="text-center">
          <p className="text-sm font-medium text-slate-700">Interested in this job?</p>
          <p className="mt-1 text-sm text-slate-500">Log in or create a contractor account to place your bid.</p>
          <div className="mt-4 flex justify-center gap-3">
            <LinkButton href="/login" variant="secondary">Log in</LinkButton>
            <LinkButton href="/register">Join &amp; bid</LinkButton>
          </div>
          <p className="mt-3 text-xs text-slate-400">Client contact is only revealed to the winning contractor.</p>
        </Card>
      )}

      {session?.user?.role === 'CLIENT' && (
        <Card className="text-center">
          <p className="text-sm font-medium text-slate-700">You&apos;re logged in as a client.</p>
          <p className="mt-1 text-sm text-slate-500">
            To bid on jobs you need a separate contractor account.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <LinkButton href="/dashboard/client" variant="secondary">My Dashboard</LinkButton>
            <LinkButton href="/register">Create contractor account</LinkButton>
          </div>
        </Card>
      )}
    </div>
  );
}
