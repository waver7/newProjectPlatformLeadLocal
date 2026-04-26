import { placeBidAction } from '@/app/actions/bid-actions';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Button, Card } from '@/components/ui';

export default async function ContractorRequestDetail({ params }: { params: { id: string } }) {
  const session = await requireRole(['CONTRACTOR']);
  const req = await prisma.request.findUnique({ where: { id: params.id }, include: { category: true, bids: { where: { contractorId: session.user.id } } } });
  if (!req || req.status !== 'OPEN') return <Card>Request unavailable</Card>;
  return <div className="space-y-3"><Card><h1 className="text-xl font-bold">{req.title}</h1><p>{req.description}</p><p className="text-sm mt-2">Client contact hidden until bid award.</p></Card>{req.bids.length === 0 ? <Card><h2 className="font-semibold mb-2">Submit bid</h2><form action={placeBidAction} className="space-y-2"><input type="hidden" name="requestId" value={req.id} /><input name="amount" type="number" className="w-full border rounded p-2" placeholder="Bid amount" /><input name="estimatedTimeline" className="w-full border rounded p-2" placeholder="Estimated timeline" /><textarea name="message" className="w-full border rounded p-2" rows={4} placeholder="Bid message" /><Button type="submit">Place bid</Button></form></Card> : <Card>You already bid on this request.</Card>}</div>;
}
