import Link from 'next/link';
import { awardBidAction } from '@/app/actions/request-actions';
import { Button, Card } from '@/components/ui';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export default async function ClientRequestDetail({ params }: { params: { id: string } }) {
  const session = await requireRole(['CLIENT']);
  const req = await prisma.request.findUnique({ where: { id: params.id }, include: { bids: { include: { contractor: { include: { contractorProfile: true } } } }, category: true } });
  if (!req || req.clientId !== session.user.id) return <Card>Not found</Card>;
  return <div className="space-y-3"><Card><h1 className="text-xl font-bold">{req.title}</h1><p>{req.category.name} • {req.status}</p><Link href={`/dashboard/client/requests/${req.id}/edit`} className="underline text-sm">Edit request</Link></Card><Card><h2 className="font-semibold mb-2">Incoming bids</h2>{req.bids.length === 0 && <p className="text-sm">No bids yet.</p>}{req.bids.map((b)=> <div key={b.id} className="border rounded p-3 mb-2"><p className="font-medium">{b.contractor.contractorProfile?.businessName}</p><p>${b.amount} • {b.estimatedTimeline}</p><p className="text-sm">{b.message}</p>{req.status === 'OPEN' && <form action={async ()=>{ 'use server'; await awardBidAction(req.id, b.id); }}><Button className="mt-2" type="submit">Accept bid</Button></form>}</div>)}</Card></div>;
}
