'use client';

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

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <p className="rounded bg-red-50 p-2 text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="rounded bg-emerald-50 p-2 text-sm text-emerald-700">{state.success}</p> : null}
      <input type="hidden" name="token" value={token} />
      <input name="password" type="password" minLength={8} required className="w-full rounded border p-2" placeholder="New password" />
      <SubmitButton />
    </form>
  );
}
