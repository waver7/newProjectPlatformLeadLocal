'use server';

import { auth } from '@/auth';
import { verifyEmailCode, generateVerificationCode } from '@/lib/email-verification';
import { sendEmailVerificationCode } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export type VerifyActionState = { error: string | null; success: string | null };

export async function verifyEmailAction(
  _prevState: VerifyActionState,
  formData: FormData
): Promise<VerifyActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const code = formData.get('code')?.toString().trim() ?? '';
  if (!/^\d{6}$/.test(code)) {
    return { error: 'Please enter the 6-digit code from your email.', success: null };
  }

  const ok = await verifyEmailCode(session.user.id, code);
  if (!ok) {
    return { error: 'Incorrect or expired code. Request a new one below.', success: null };
  }

  // Redirect to login so the JWT is refreshed with emailVerified = true
  redirect('/login?verified=1');
}

export async function resendVerificationCodeAction(
  _prevState: VerifyActionState,
  _formData: FormData
): Promise<VerifyActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true },
  });

  if (user?.emailVerified) {
    return { error: null, success: 'Your email is already verified.' };
  }

  try {
    const code = await generateVerificationCode(session.user.id);
    await sendEmailVerificationCode(user!.email, code);
    return { error: null, success: 'A new code has been sent to your email.' };
  } catch {
    return { error: 'Failed to send email. Please try again later.', success: null };
  }
}
