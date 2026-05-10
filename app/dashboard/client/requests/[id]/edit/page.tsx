import Link from 'next/link';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, SectionHeader } from '@/components/ui';
import { EditRequestForm } from './edit-request-form';

export default async function EditRequest({ params }: { params: { id: string } }) {
  const session = await requireRole(['CLIENT']);
  const req = await prisma.request.findUnique({ where: { id: params.id } });
  if (!req || req.clientId !== session.user.id) {
    return <Card><p className="text-slate-500">Request not found.</p></Card>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href={`/dashboard/client/requests/${req.id}`} className="text-sm text-brand-600 hover:underline">← Back to request</Link>
      <SectionHeader title="Edit Request" subtitle={req.title} />
      <Card>
        <EditRequestForm id={req.id} title={req.title} city={req.city} description={req.description} />
      </Card>
    </div>
  );
}
