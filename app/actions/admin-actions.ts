'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { adminSettingsSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

type SettingsActionState = { error: string | null; success: string | null };

export async function updateSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return { error: 'Unauthorized', success: null };

  const parsed = adminSettingsSchema.safeParse({
    freePostLimit: formData.get('freePostLimit'),
    requireContractorSubscription: formData.get('requireContractorSubscription') === 'on',
    requireBidCredits: formData.get('requireBidCredits') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid settings', success: null };
  }

  await prisma.adminSettings.updateMany({
    data: {
      freePostLimit: parsed.data.freePostLimit,
      requireContractorSubscription: parsed.data.requireContractorSubscription,
      requireBidCredits: parsed.data.requireBidCredits,
    },
  });

  revalidatePath('/dashboard/admin/settings');
  return { error: null, success: 'Settings saved.' };
}
