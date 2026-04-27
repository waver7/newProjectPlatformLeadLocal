import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

async function toggleUser(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const isActive = formData.get('isActive') === 'true';
  await prisma.user.update({ where: { id }, data: { isActive: !isActive } });
}

export default async function AdminUsers() {
  await requireRole(['ADMIN']);
  const users = await prisma.user.findMany({ include: { profile: true }, orderBy: { createdAt: 'desc' } });
  return <div className="space-y-2">{users.map((u)=> <Card key={u.id}><p>{u.profile?.fullName} • {u.email} • {u.role}</p><form action={toggleUser}><input type="hidden" name="id" value={u.id}/><input type="hidden" name="isActive" value={String(u.isActive)} /><button className="underline text-sm">{u.isActive ? 'Disable' : 'Enable'}</button></form></Card>)}</div>;
}
