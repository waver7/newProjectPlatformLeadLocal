'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { placeBidAction, type BidActionState } from '@/app/actions/bid-actions';
import { Button, Alert, FormField, Input, Textarea } from '@/components/ui';

const initialState: BidActionState = { error: null, success: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Submitting…' : 'Submit Bid'}
    </Button>
  );
}

export function PlaceBidForm({ requestId }: { requestId: string }) {
  const [state, formAction] = useFormState(placeBidAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert variant="error">{state.error}</Alert>}
      {state.success && <Alert variant="success">{state.success}</Alert>}

      <input type="hidden" name="requestId" value={requestId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Bid Amount ($)" required>
          <Input name="amount" type="number" placeholder="e.g. 350" required min={1} step="0.01" />
        </FormField>
        <FormField label="Estimated Timeline" required>
          <Input name="estimatedTimeline" placeholder="e.g. 2–3 days" required minLength={2} />
        </FormField>
      </div>

      <FormField label="Message to Client" required hint="Describe your approach, experience, and why you're the best fit.">
        <Textarea name="message" rows={5} placeholder="Hi, I'd love to help with this project…" required minLength={10} />
      </FormField>

      <SubmitButton />
    </form>
  );
}
