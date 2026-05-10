'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createRequestAction, type RequestActionState } from '@/app/actions/request-actions';
import { Button, Alert, FormField, Input, Textarea, Select } from '@/components/ui';

const initial: RequestActionState = { error: null, success: null };

// Major Ohio cities for the datalist
const OHIO_CITIES = [
  'Akron','Alliance','Ashland','Ashtabula','Athens','Barberton','Beavercreek',
  'Bedford','Bowling Green','Brunswick','Canton','Centerville','Chillicothe',
  'Cincinnati','Cleveland','Cleveland Heights','Columbus','Cuyahoga Falls',
  'Dayton','Dublin','East Cleveland','Elyria','Euclid','Fairborn','Fairfield',
  'Findlay','Gahanna','Garfield Heights','Grove City','Hamilton','Hilliard',
  'Hudson','Huber Heights','Kent','Kettering','Lakewood','Lancaster','Lima',
  'Lorain','Mansfield','Marion','Mason','Medina','Mentor','Middletown',
  'Newark','North Olmsted','North Ridgeville','Norwood','Parma','Parma Heights',
  'Pickerington','Portsmouth','Reynoldsburg','Rocky River','Sandusky',
  'Shaker Heights','Solon','Springfield','Stow','Strongsville','Toledo',
  'Troy','Upper Arlington','Warren','Westerville','Westlake','Wooster',
  'Xenia','Youngstown','Zanesville',
];

const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],
  ['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],
  ['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],
  ['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],
  ['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
  ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],
  ['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],
  ['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],
  ['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],
  ['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],
  ['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],
  ['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],
  ['WI','Wisconsin'],['WY','Wyoming'],
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full justify-center" size="lg">
      {pending ? 'Submitting…' : 'Submit Request'}
    </Button>
  );
}

export function RequestForm({ categories }: { categories: Array<{ id: string; name: string }> }) {
  const [state, formAction] = useFormState(createRequestAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Important:</strong> Do not include phone numbers, email addresses, or social media handles in your title or description. Your contact details will be shared with the winning contractor automatically after you award a bid.
      </div>

      <FormField label="Request Title" required hint="Be specific — e.g. 'Fix leaking kitchen sink under cabinet'">
        <Input name="title" placeholder="e.g. Repair bathroom tile grout" required minLength={5} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Category" required>
          <Select name="categoryId" required>
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Urgency" required>
          <Select name="urgency" defaultValue="MEDIUM" required>
            <option value="LOW">Low — flexible timing</option>
            <option value="MEDIUM">Medium — within a week</option>
            <option value="HIGH">High — within a few days</option>
            <option value="EMERGENCY">Emergency — ASAP</option>
          </Select>
        </FormField>

        {/* City with datalist autocomplete */}
        <FormField label="City" required>
          <Input
            name="city"
            placeholder="e.g. Columbus"
            required
            minLength={2}
            list="ohio-cities-list"
            autoComplete="off"
          />
          <datalist id="ohio-cities-list">
            {OHIO_CITIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </FormField>

        <FormField label="State" required>
          <Select name="state" defaultValue="OH" required>
            <option value="">Select state…</option>
            {US_STATES.map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="ZIP Code" hint="Used to match nearby contractors">
          <Input name="zipCode" placeholder="e.g. 43201" maxLength={5} pattern="\d{5}" />
        </FormField>

        <FormField label="Budget ($)">
          <Input name="budget" type="number" placeholder="e.g. 300" min={0} step="0.01" />
        </FormField>

        <FormField label="Preferred Date">
          <Input name="preferredDate" type="date" />
        </FormField>
      </div>

      <FormField label="Description" required hint="Include details like size, materials, access info. No contact info — your details are shared automatically after award.">
        <Textarea name="description" rows={5} placeholder="Describe the job in detail…" required minLength={20} />
      </FormField>

      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
        <p className="mb-3 text-sm font-semibold text-brand-900">Your Private Contact Info</p>
        <p className="mb-3 text-xs text-brand-700">Only shared with the contractor you award the bid to — never shown publicly.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Private Phone" required>
            <Input name="phonePrivate" type="tel" placeholder="555-123-4567" required minLength={7} />
          </FormField>
          <FormField label="Private Email" required>
            <Input name="emailPrivate" type="email" placeholder="you@example.com" required />
          </FormField>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
