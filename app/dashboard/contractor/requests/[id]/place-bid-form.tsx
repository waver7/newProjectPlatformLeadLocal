'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { placeBidAction, type BidActionState } from '@/app/actions/bid-actions';
import { Button } from '@/components/ui';

const initialState: BidActionState = { error: null, success: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Submitting...' : 'Place bid'}</Button>;
}

export function PlaceBidForm({ requestId }: { requestId: string }) {
  const [state, formAction] = useFormState(placeBidAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      {state.error ? <p className="rounded bg-red-50 p-2 text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="rounded bg-emerald-50 p-2 text-sm text-emerald-700">{state.success}</p> : null}
      <input type="hidden" name="requestId" value={requestId} />
      <input name="amount" type="number" className="w-full rounded border p-2" placeholder="Bid amount" required min={1} step="0.01" />
      <input name="estimatedTimeline" className="w-full rounded border p-2" placeholder="Estimated timeline" required minLength={2} />
      <textarea name="message" className="w-full rounded border p-2" rows={4} placeholder="Bid message" required minLength={10} />
      <SubmitButton />
    </form>
  );
}
