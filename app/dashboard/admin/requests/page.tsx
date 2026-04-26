import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

async function moderateRequest(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const action = String(formData.get('action'));
  await prisma.request.update({ where: { id }, data: { moderationStatus: action === 'approve' ? 'APPROVED' : 'REJECTED', status: action === 'approve' ? 'OPEN' : 'REJECTED' } });
}

export default async function AdminRequests() {
  await requireRole(['ADMIN']);
  const requests = await prisma.request.findMany({ include: { client: true, category: true }, orderBy: { createdAt: 'desc' } });
  return <div className="space-y-2">{requests.map((r)=> <Card key={r.id}><p className="font-semibold">{r.title}</p><p className="text-sm">{r.category.name} • {r.moderationStatus}</p><form action={moderateRequest} className="flex gap-2 mt-2"><input type="hidden" name="id" value={r.id}/><button name="action" value="approve" className="underline text-sm">Approve</button><button name="action" value="reject" className="underline text-sm text-red-600">Reject</button></form></Card>)}</div>;
}
