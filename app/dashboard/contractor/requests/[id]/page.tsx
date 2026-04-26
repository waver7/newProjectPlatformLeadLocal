import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';
import { PlaceBidForm } from './place-bid-form';

export default async function ContractorRequestDetail({ params }: { params: { id: string } }) {
  const session = await requireRole(['CONTRACTOR']);
  const req = await prisma.request.findUnique({
    where: { id: params.id },
    include: { category: true, bids: { where: { contractorId: session.user.id } } }
  });

  if (!req || req.status !== 'OPEN') return <Card>Request unavailable</Card>;

  return (
    <div className="space-y-3">
      <Card>
        <h1 className="text-xl font-bold">{req.title}</h1>
        <p>{req.description}</p>
        <p className="mt-2 text-sm">Client contact hidden until bid award.</p>
      </Card>

      {req.bids.length === 0 ? (
        <Card>
          <h2 className="mb-2 font-semibold">Submit bid</h2>
          <PlaceBidForm requestId={req.id} />
        </Card>
      ) : (
        <Card>You already bid on this request.</Card>
      )}
    </div>
  );
}
