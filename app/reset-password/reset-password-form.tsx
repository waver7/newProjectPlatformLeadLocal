'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { resetPasswordAction, type AuthActionState } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui';

const initialState: AuthActionState = { error: null, success: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Updating...' : 'Update password'}</Button>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPasswordAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    const timer = setTimeout(() => router.push('/login?reset=1'), 2500);
    return () => clearTimeout(timer);
  }, [state.success, router]);

  if (state.success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
        <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Password updated</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your password has been changed. Redirecting you to the login page…
          </p>
          <Button className="mt-4 w-full justify-center" onClick={() => router.push('/login?reset=1')}>
            Go to login now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <p className="rounded bg-red-50 p-2 text-sm text-red-700">{state.error}</p> : null}
      <input type="hidden" name="token" value={token} />
      <input name="password" type="password" minLength={8} required className="w-full rounded border p-2" placeholder="New password" />
      <SubmitButton />
    </form>
  );
}
