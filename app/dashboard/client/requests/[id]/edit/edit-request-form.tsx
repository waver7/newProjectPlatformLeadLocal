'use client';

import { updateRequestAction, type RequestActionState } from '@/app/actions/request-actions';
import { Button } from '@/components/ui';
import { useFormState, useFormStatus } from 'react-dom';

const initialState: RequestActionState = { error: null, success: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save'}</Button>;
}

export function EditRequestForm({ id, title, city, description }: { id: string; title: string; city: string; description: string }) {
  const [state, formAction] = useFormState(updateRequestAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <p className="rounded bg-red-50 p-2 text-sm text-red-700">{state.error}</p> : null}
      <input type="hidden" name="id" value={id} />
      <input name="title" defaultValue={title} className="w-full rounded border p-2" required minLength={5} />
      <input name="city" defaultValue={city} className="w-full rounded border p-2" required minLength={2} />
      <textarea name="description" defaultValue={description} className="w-full rounded border p-2" rows={4} required minLength={20} />
      <SubmitButton />
    </form>
  );
}
