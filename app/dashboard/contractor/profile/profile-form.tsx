'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { saveContractorProfileAction, type ContractorActionState } from '@/app/actions/contractor-actions';
import { Button, Alert, FormField, Input, Textarea } from '@/components/ui';

const initial: ContractorActionState = { error: null, success: null };

function SaveButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save Profile'}</Button>;
}

type Props = {
  businessName: string;
  serviceArea: string;
  bio: string;
  phone: string;
  email: string;
  website: string | null;
};

export function ContractorProfileForm({ businessName, serviceArea, bio, phone, email, website }: Props) {
  const [state, action] = useFormState(saveContractorProfileAction, initial);

  return (
    <>
      {state.error && <Alert variant="error">{state.error}</Alert>}
      {state.success && <Alert variant="success">{state.success}</Alert>}

      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Business Name" required>
            <Input name="businessName" defaultValue={businessName} placeholder="e.g. Smith Plumbing Co." required minLength={2} />
          </FormField>
          <FormField label="Service Area" required>
            <Input name="serviceArea" defaultValue={serviceArea} placeholder="e.g. Austin Metro" required minLength={2} />
          </FormField>
          <FormField label="Phone" required>
            <Input name="phone" defaultValue={phone} type="tel" placeholder="e.g. 555-123-4567" required minLength={7} />
          </FormField>
          <FormField label="Business Email" required>
            <Input name="email" defaultValue={email} type="email" placeholder="you@business.com" required />
          </FormField>
        </div>

        <FormField label="Website">
          <Input name="website" defaultValue={website ?? ''} type="url" placeholder="https://yourbusiness.com" />
        </FormField>

        <FormField label="Bio" required hint="Tell clients about your experience, certifications, and specialties.">
          <Textarea name="bio" defaultValue={bio} rows={5} placeholder="Licensed plumber with 10+ years of experience…" required minLength={10} />
        </FormField>

        <SaveButton />
      </form>
    </>
  );
}
