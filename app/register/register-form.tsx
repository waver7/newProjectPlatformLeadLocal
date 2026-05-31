'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { registerAction, type AuthActionState } from '@/app/actions/auth-actions';
import { Button, Alert, FormField, Input } from '@/components/ui';

const initial: AuthActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full justify-center">
      {pending ? 'Creating account…' : 'Create account'}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <FormField label="Full name" required>
        <Input name="fullName" placeholder="Jane Smith" required minLength={2} autoComplete="name" />
      </FormField>

      <FormField label="Username" required hint="3-20 characters: letters, numbers, underscores. Used to sign in.">
        <Input
          name="username"
          placeholder="janesmith"
          required
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_]+"
          autoComplete="username"
        />
      </FormField>

      <FormField label="Email address" required hint="Used for verification and password reset only.">
        <Input name="email" type="email" placeholder="jane@example.com" required autoComplete="email" />
      </FormField>

      <FormField label="Password" required hint="At least 8 characters">
        <Input name="password" type="password" placeholder="••••••••" required minLength={8} autoComplete="new-password" />
      </FormField>

      <FormField label="I am a…" required>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'CLIENT', label: 'Client', desc: 'Post tasks & hire' },
            { value: 'CONTRACTOR', label: 'Contractor', desc: 'Find jobs & bid' }
          ].map((opt) => (
            <label key={opt.value} className="relative flex cursor-pointer rounded-lg border border-slate-200 p-3 hover:border-brand-400 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <input type="radio" name="role" value={opt.value} defaultChecked={opt.value === 'CLIENT'} className="sr-only" required />
              <div>
                <p className="font-medium text-slate-900">{opt.label}</p>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </FormField>

      <div className="flex items-start gap-2.5">
        <input
          id="agreedToTerms"
          name="agreedToTerms"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="agreedToTerms" className="text-sm text-slate-600">
          I have read and agree to the{' '}
          <Link href="/terms" target="_blank" className="font-medium text-brand-600 hover:underline">
            Terms &amp; Conditions
          </Link>{' '}
          and{' '}
          <Link href="/privacy" target="_blank" className="font-medium text-brand-600 hover:underline">
            Privacy Policy
          </Link>
          . I am at least 18 years old.
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
