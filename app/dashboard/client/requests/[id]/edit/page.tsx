import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';
import { EditRequestForm } from './edit-request-form';

export default async function EditRequest({ params }: { params: { id: string } }) {
  const session = await requireRole(['CLIENT']);
  const req = await prisma.request.findUnique({ where: { id: params.id } });
  if (!req || req.clientId !== session.user.id) return <Card>Not found</Card>;

  return (
    <Card>
      <h1 className="mb-3 text-lg font-semibold">Edit request</h1>
      <EditRequestForm id={req.id} title={req.title} city={req.city} description={req.description} />
    </Card>
  );
}
