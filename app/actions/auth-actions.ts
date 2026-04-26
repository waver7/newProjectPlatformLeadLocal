'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema, registerSchema, resetPasswordSchema } from '@/lib/schemas';
import { signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { consumePasswordResetToken, issuePasswordResetToken } from '@/lib/password-reset';
import { sendPasswordResetEmail } from '@/lib/email';

export type AuthActionState = {
  error: string | null;
  success?: string | null;
};

export async function registerAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data', success: null };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: 'Email already used', success: null };
  }

  const hash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: hash,
      role: parsed.data.role,
      profile: { create: { fullName: parsed.data.fullName } },
      clientProfile:
        parsed.data.role === 'CLIENT'
          ? { create: { phonePrivate: 'pending', emailPrivate: parsed.data.email } }
          : undefined,
      contractorProfile:
        parsed.data.role === 'CONTRACTOR'
          ? {
              create: {
                businessName: parsed.data.fullName,
                serviceArea: 'Local',
                bio: 'New contractor profile',
                phone: 'pending',
                email: parsed.data.email
              }
            }
          : undefined,
      creditWallet: { create: {} }
    }
  });

  const loginResult = await signIn('credentials', {
    email: user.email,
    password: parsed.data.password,
    redirect: false
  });

  if (loginResult?.error) {
    redirect('/login?error=account_created_login_failed');
  }

  redirect(user.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/contractor');
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/'
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        redirect('/login?error=invalid_credentials');
      }
      redirect('/login?error=auth_failed');
    }

    throw error;
  }
}

export async function forgotPasswordAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Please provide a valid email.', success: null };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return { error: null, success: 'If an account exists, a reset link has been sent.' };
  }

  const token = await issuePasswordResetToken(user.id);
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  return { error: null, success: 'If an account exists, a reset link has been sent.' };
}

export async function resetPasswordAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Invalid reset token or password.', success: null };

  const ok = await consumePasswordResetToken(parsed.data.token, parsed.data.password);
  if (!ok) return { error: 'Reset link is invalid or expired.', success: null };

  return { error: null, success: 'Password updated. You can now log in.' };
}
