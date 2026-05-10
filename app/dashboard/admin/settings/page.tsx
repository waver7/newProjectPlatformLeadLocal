import { requireRole } from '@/lib/permissions';
import { getSettings } from '@/lib/data';
import { Card, SectionHeader } from '@/components/ui';
import { AdminSettingsForm } from './settings-form';

export default async function AdminSettings() {
  await requireRole(['ADMIN']);
  const s = await getSettings();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <SectionHeader title="Platform Settings" subtitle="Configure global rules for clients and contractors" />
      <Card>
        <AdminSettingsForm
          freePostLimit={s.freePostLimit}
          requireContractorSubscription={s.requireContractorSubscription}
          requireBidCredits={s.requireBidCredits}
        />
      </Card>
    </div>
  );
}
