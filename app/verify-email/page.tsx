'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { verifyEmailAction, resendVerificationCodeAction } from '@/app/actions/verify-actions';
import { Alert, Button, Card } from '@/components/ui';

const initial = { error: null, success: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full justify-center">
      {pending ? 'Please wait…' : label}
    </Button>
  );
}

export default function VerifyEmailPage() {
  const [verifyState, verifyAction] = useFormState(verifyEmailAction, initial);
  const [resendState, resendAction] = useFormState(resendVerificationCodeAction, initial);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
            <svg className="h-7 w-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
          <p className="mt-1 text-sm text-slate-500">
            We sent a 6-digit code to the email you registered with. Enter it below to verify your account.
          </p>
        </div>

        <Card className="space-y-4">
          {verifyState.error && <Alert variant="error">{verifyState.error}</Alert>}

          <form action={verifyAction} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Verification code</label>
              <input
                name="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                required
                autoFocus
                autoComplete="one-time-code"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] placeholder-slate-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <SubmitButton label="Verify email" />
          </form>

          <div className="border-t pt-4">
            <p className="mb-3 text-center text-sm text-slate-500">Didn&apos;t receive the code?</p>
            {resendState.success && <Alert variant="success">{resendState.success}</Alert>}
            {resendState.error && <Alert variant="error">{resendState.error}</Alert>}
            <form action={resendAction}>
              <Button type="submit" variant="secondary" className="w-full justify-center">
                Resend code
              </Button>
            </form>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-400">
          The code expires after 15 minutes. Check your spam folder if it doesn&apos;t arrive.
        </p>
      </div>
    </div>
  );
}
