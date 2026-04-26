'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/schemas';
import { signIn } from '@/auth';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid data' };
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: 'Email already used' };
  const hash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: hash,
      role: parsed.data.role,
      profile: { create: { fullName: parsed.data.fullName } },
      clientProfile: parsed.data.role === 'CLIENT' ? { create: { phonePrivate: 'pending', emailPrivate: parsed.data.email } } : undefined,
      contractorProfile: parsed.data.role === 'CONTRACTOR' ? { create: { businessName: parsed.data.fullName, serviceArea: 'Local', bio: 'New contractor profile', phone: 'pending', email: parsed.data.email } } : undefined,
      creditWallet: { create: {} }
    }
  });
  await signIn('credentials', { email: user.email, password: parsed.data.password, redirect: false });
  redirect(user.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/contractor');
}

export async function loginAction(formData: FormData) {
  await signIn('credentials', {
    email: String(formData.get('email')),
    password: String(formData.get('password')),
    redirectTo: '/'
  });
}
