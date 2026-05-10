'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { adminSettingsSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export async function updateSettingsAction(_prevState: { error: string | null; success: string | null }, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return { error: 'Unauthorized', success: null };

  const parsed = adminSettingsSchema.safeParse({
    freePostLimit: formData.get('freePostLimit'),
    requireContractorSubscription: formData.get('requireContractorSubscription') === 'on',
    requireBidCredits: formData.get('requireBidCredits') === 'on'
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid settings', success: null };
  }

  const existing = await prisma.adminSettings.findFirst();
  if (existing) {
    await prisma.adminSettings.update({ where: { id: existing.id }, data: parsed.data });
  } else {
    await prisma.adminSettings.create({ data: parsed.data });
  }

  revalidatePath('/dashboard/admin/settings');
  return { error: null, success: 'Settings saved.' };
}
