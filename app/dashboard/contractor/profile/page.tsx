import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';
import { ContractorProfileForm } from './profile-form';

export default async function ContractorProfilePage() {
  const session = await requireRole(['CONTRACTOR']);
  const p = await prisma.contractorProfile.findUnique({ where: { userId: session.user.id } });
  if (!p) return <Card><p className="text-slate-500">Profile not found. Please contact support.</p></Card>;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Update your business information visible to potential clients.</p>
      </div>

      <Card>
        <ContractorProfileForm
          businessName={p.businessName}
          serviceArea={p.serviceArea}
          bio={p.bio}
          phone={p.phone}
          email={p.email}
          website={p.website}
        />
      </Card>
    </div>
  );
}
