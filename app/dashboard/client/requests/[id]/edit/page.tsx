import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Button, Card } from '@/components/ui';

async function updateRequest(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  await prisma.request.update({ where: { id }, data: { title: String(formData.get('title')), description: String(formData.get('description')), city: String(formData.get('city')) } });
}

export default async function EditRequest({ params }: { params: { id: string } }) {
  const session = await requireRole(['CLIENT']);
  const req = await prisma.request.findUnique({ where: { id: params.id } });
  if (!req || req.clientId !== session.user.id) return <Card>Not found</Card>;
  return <Card><form action={updateRequest} className="space-y-3"><input type="hidden" name="id" value={req.id} /><input name="title" defaultValue={req.title} className="w-full border p-2 rounded" /><input name="city" defaultValue={req.city} className="w-full border p-2 rounded" /><textarea name="description" defaultValue={req.description} className="w-full border p-2 rounded" rows={4} /><Button type="submit">Save</Button></form></Card>;
}
