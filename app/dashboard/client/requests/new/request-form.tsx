'use client';

import { createRequestAction, type RequestActionState } from '@/app/actions/request-actions';
import { Button } from '@/components/ui';
import { useFormState, useFormStatus } from 'react-dom';

const initialState: RequestActionState = { error: null, success: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="md:col-span-2" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit request'}
    </Button>
  );
}

export function RequestForm({ categories }: { categories: Array<{ id: string; name: string }> }) {
  const [state, formAction] = useFormState(createRequestAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      {state.error ? <p className="rounded bg-red-50 p-2 text-sm text-red-700 md:col-span-2">{state.error}</p> : null}
      <input name="title" placeholder="Title" className="rounded border p-2 md:col-span-2" required minLength={5} />
      <select name="categoryId" className="rounded border p-2" required>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input name="city" className="rounded border p-2" placeholder="City" required minLength={2} />
      <input name="zipCode" className="rounded border p-2" placeholder="Zip code" />
      <select name="urgency" className="rounded border p-2" defaultValue="MEDIUM" required>
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
        <option value="EMERGENCY">EMERGENCY</option>
      </select>
      <input name="budget" type="number" className="rounded border p-2" placeholder="Budget" min={0} step="0.01" />
      <input name="preferredDate" type="date" className="rounded border p-2" />
      <input name="phonePrivate" className="rounded border p-2" placeholder="Private phone" required minLength={7} />
      <input name="emailPrivate" type="email" className="rounded border p-2 md:col-span-2" placeholder="Private email" required />
      <textarea
        name="description"
        className="rounded border p-2 md:col-span-2"
        rows={5}
        placeholder="Description"
        required
        minLength={20}
      />
      <SubmitButton />
    </form>
  );
}
