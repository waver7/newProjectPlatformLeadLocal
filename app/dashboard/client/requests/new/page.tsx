import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';
import { RequestForm } from './request-form';

export default async function NewRequestPage() {
  await requireRole(['CLIENT']);
  const categories = await prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true } });

  return (
    <Card>
      <h1 className="mb-3 text-xl font-semibold">New request</h1>
      <RequestForm categories={categories} />
    </Card>
  );
}
