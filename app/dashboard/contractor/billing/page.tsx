import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

export default async function ContractorBillingPage() {
  const session = await requireRole(['CONTRACTOR']);
  const subs = await prisma.subscription.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } });
  return <Card><h1 className="text-xl font-semibold">Billing</h1><p className="text-sm text-slate-600">Stripe-ready abstraction currently running in mock mode.</p>{subs.map((s)=> <p key={s.id} className="text-sm">{s.planCode} - {s.status} until {s.endsAt.toDateString()}</p>)}</Card>;
}
