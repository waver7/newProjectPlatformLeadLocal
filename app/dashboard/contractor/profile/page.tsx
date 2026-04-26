import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Button, Card } from '@/components/ui';

async function saveProfile(formData: FormData) {
  'use server';
  const { auth } = await import('@/auth');
  const session = await auth();
  if (!session?.user) return;
  await prisma.contractorProfile.update({ where: { userId: session.user.id }, data: { businessName: String(formData.get('businessName')), serviceArea: String(formData.get('serviceArea')), bio: String(formData.get('bio')), phone: String(formData.get('phone')), email: String(formData.get('email')), website: String(formData.get('website') || '') || null } });
}

export default async function ContractorProfilePage() {
  const session = await requireRole(['CONTRACTOR']);
  const p = await prisma.contractorProfile.findUnique({ where: { userId: session.user.id } });
  if (!p) return <Card>Profile missing</Card>;
  return <Card><form action={saveProfile} className="space-y-2"><input name="businessName" defaultValue={p.businessName} className="w-full border rounded p-2" /><input name="serviceArea" defaultValue={p.serviceArea} className="w-full border rounded p-2" /><textarea name="bio" defaultValue={p.bio} className="w-full border rounded p-2" /><input name="phone" defaultValue={p.phone} className="w-full border rounded p-2" /><input name="email" defaultValue={p.email} className="w-full border rounded p-2" /><input name="website" defaultValue={p.website ?? ''} className="w-full border rounded p-2" /><Button type="submit">Save profile</Button></form></Card>;
}
