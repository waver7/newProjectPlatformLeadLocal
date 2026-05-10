'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateRequestAction, type RequestActionState } from '@/app/actions/request-actions';
import { Button, Alert, FormField, Input, Textarea } from '@/components/ui';

const initial: RequestActionState = { error: null, success: null };

function SaveButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save Changes'}</Button>;
}

export function EditRequestForm({ id, title, city, description }: { id: string; title: string; city: string; description: string }) {
  const [state, formAction] = useFormState(updateRequestAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert variant="error">{state.error}</Alert>}
      <input type="hidden" name="id" value={id} />

      <FormField label="Title" required>
        <Input name="title" defaultValue={title} required minLength={5} />
      </FormField>
      <FormField label="City" required>
        <Input name="city" defaultValue={city} required minLength={2} />
      </FormField>
      <FormField label="Description" required>
        <Textarea name="description" defaultValue={description} rows={6} required minLength={20} />
      </FormField>

      <SaveButton />
    </form>
  );
}
