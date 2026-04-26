'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function updateSettingsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const freePostLimit = Number(formData.get('freePostLimit'));
  const requireContractorSubscription = formData.get('requireContractorSubscription') === 'on';
  const requireBidCredits = formData.get('requireBidCredits') === 'on';

  const existing = await prisma.adminSettings.findFirst();
  if (existing) {
    await prisma.adminSettings.update({ where: { id: existing.id }, data: { freePostLimit, requireContractorSubscription, requireBidCredits } });
  } else {
    await prisma.adminSettings.create({ data: { freePostLimit, requireContractorSubscription, requireBidCredits } });
  }
  return { ok: true };
}
