'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema, registerSchema, resetPasswordSchema } from '@/lib/schemas';
import { signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { consumePasswordResetToken, issuePasswordResetToken } from '@/lib/password-reset';
import { sendPasswordResetEmail } from '@/lib/email';
import { createTrialSubscription } from '@/lib/billing';
import { generateVerificationCode } from '@/lib/email-verification';
import { sendEmailVerificationCode } from '@/lib/email';

export type AuthActionState = {
  error: string | null;
  success?: string | null;
};

export async function registerAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data', success: null };
  }

  const agreedToTerms = formData.get('agreedToTerms');
  if (agreedToTerms !== 'on' && agreedToTerms !== 'true') {
    return { error: 'You must agree to the Terms & Conditions to create an account.', success: null };
  }

  const existingEmail = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingEmail) {
    return { error: 'An account with this email already exists', success: null };
  }

  const existingUsername = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (existingUsername) {
    return { error: 'That username is already taken. Please choose another.', success: null };
  }

  const hash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      username: parsed.data.username,
      email: parsed.data.email,
      passwordHash: hash,
      role: parsed.data.role,
      agreedToTermsAt: new Date(),
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

  if (user.role === 'CLIENT') {
    await createTrialSubscription(user.id);
  }

  try {
    const code = await generateVerificationCode(user.id);
    await sendEmailVerificationCode(user.email, code);
  } catch (err) {
    console.error('[register] Failed to send verification email:', err);
  }

  try {
    await signIn('credentials', {
      username: user.username,
      password: parsed.data.password,
      redirect: false
    });
  } catch {
    redirect('/login?error=account_created_login_failed');
  }

  redirect(user.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/contractor');
}

export async function loginAction(formData: FormData) {
  const username = String(formData.get('username') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  try {
    await signIn('credentials', {
      username,
      password,
      redirectTo: '/dashboard'
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
