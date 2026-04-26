import { updateSettingsAction } from '@/app/actions/admin-actions';
import { requireRole } from '@/lib/permissions';
import { getSettings } from '@/lib/data';
import { Button, Card } from '@/components/ui';

export default async function AdminSettings() {
  await requireRole(['ADMIN']);
  const s = await getSettings();
  return <Card><h1 className="text-xl font-semibold mb-3">Platform settings</h1><form action={updateSettingsAction} className="space-y-3"><label className="block">Free post limit<input className="border p-2 rounded ml-2" type="number" name="freePostLimit" defaultValue={s.freePostLimit} /></label><label className="block"><input type="checkbox" name="requireContractorSubscription" defaultChecked={s.requireContractorSubscription} /> Require contractor subscription</label><label className="block"><input type="checkbox" name="requireBidCredits" defaultChecked={s.requireBidCredits} /> Require bid credits</label><Button type="submit">Save settings</Button></form></Card>;
}
