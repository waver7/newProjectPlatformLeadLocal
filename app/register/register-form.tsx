'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { registerAction, type AuthActionState } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui';

const initialState: AuthActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create account'}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{state.error}</p> : null}
      <input name="fullName" className="w-full rounded border p-2" placeholder="Full name" required minLength={2} />
      <input name="email" type="email" className="w-full rounded border p-2" placeholder="Email" required />
      <input
        name="password"
        type="password"
        className="w-full rounded border p-2"
        placeholder="Password (8+ chars)"
        required
        minLength={8}
      />
      <select name="role" className="w-full rounded border p-2" defaultValue="CLIENT" required>
        <option value="CLIENT">Client</option>
        <option value="CONTRACTOR">Contractor</option>
      </select>
      <SubmitButton />
    </form>
  );
}
