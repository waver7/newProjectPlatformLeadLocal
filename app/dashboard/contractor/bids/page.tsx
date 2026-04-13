import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

export default async function ContractorBidsPage() {
  const session = await requireRole(['CONTRACTOR']);
  const bids = await prisma.bid.findMany({ where: { contractorId: session.user.id }, include: { request: { include: { client: { include: { clientProfile: true, profile: true } } } } }, orderBy: { createdAt: 'desc' } });
  return <div className="space-y-3">{bids.map((b)=> { const awardedToMe = b.request.awardedBidId === b.id; const cp = b.request.client.clientProfile; return <Card key={b.id}><h2 className="font-semibold">{b.request.title}</h2><p>Status: {b.status}</p>{awardedToMe && cp ? <p className="text-sm text-emerald-700">Contact: {cp.phonePrivate} • {cp.emailPrivate}</p> : <p className="text-sm text-slate-500">Contact hidden until awarded.</p>}</Card>; })}</div>;
}
