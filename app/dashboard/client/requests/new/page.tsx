import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, SectionHeader } from '@/components/ui';
import { RequestForm } from './request-form';

export default async function NewRequestPage() {
  await requireRole(['CLIENT']);
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <SectionHeader title="Post a Request" subtitle="Describe what you need and contractors will bid on it" />
      <Card>
        <RequestForm categories={categories} />
      </Card>
    </div>
  );
}
