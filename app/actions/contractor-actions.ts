'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { contractorProfileSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export type ContractorActionState = {
  error: string | null;
  success?: string | null;
};

export async function saveContractorProfileAction(
  _prevState: ContractorActionState,
  formData: FormData
): Promise<ContractorActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'CONTRACTOR') return { error: 'Unauthorized', success: null };

  const parsed = contractorProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input', success: null };
  }

  await prisma.contractorProfile.update({
    where: { userId: session.user.id },
    data: {
      businessName: parsed.data.businessName,
      serviceArea: parsed.data.serviceArea,
      bio: parsed.data.bio,
      phone: parsed.data.phone,
      email: parsed.data.email,
      website: parsed.data.website || null
    }
  });

  revalidatePath('/dashboard/contractor/profile');
  return { error: null, success: 'Profile saved successfully.' };
}
