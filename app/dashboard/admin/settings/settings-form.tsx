'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateSettingsAction } from '@/app/actions/admin-actions';
import { Button, Alert, FormField, Input } from '@/components/ui';

type Props = { freePostLimit: number; requireContractorSubscription: boolean; requireBidCredits: boolean };

const initial = { error: null, success: null };

function SaveButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save Settings'}</Button>;
}

export function AdminSettingsForm({ freePostLimit, requireContractorSubscription, requireBidCredits }: Props) {
  const [state, action] = useFormState(updateSettingsAction, initial);

  return (
    <>
      {state.error && <Alert variant="error">{state.error}</Alert>}
      {state.success && <Alert variant="success">{state.success}</Alert>}
      <form action={action} className="space-y-5">
        <FormField label="Free Post Limit per Client" hint="Maximum number of requests a client can post for free.">
          <Input type="number" name="freePostLimit" defaultValue={freePostLimit} min={0} max={100} className="max-w-xs" required />
        </FormField>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Access Controls</p>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
            <input
              type="checkbox"
              name="requireContractorSubscription"
              defaultChecked={requireContractorSubscription}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">Require contractor subscription to bid</p>
              <p className="text-xs text-slate-500">Contractors must have an active subscription before placing bids.</p>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
            <input
              type="checkbox"
              name="requireBidCredits"
              defaultChecked={requireBidCredits}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">Require bid credits</p>
              <p className="text-xs text-slate-500">Contractors spend credits each time they place a bid.</p>
            </div>
          </label>
        </div>

        <SaveButton />
      </form>
    </>
  );
}
