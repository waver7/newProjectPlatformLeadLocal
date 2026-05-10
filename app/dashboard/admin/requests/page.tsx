import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, SectionHeader, StatusBadge, UrgencyBadge, Button } from '@/components/ui';
import { revalidatePath } from 'next/cache';

async function moderateRequest(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const action = String(formData.get('action'));
  await prisma.request.update({
    where: { id },
    data: {
      moderationStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
      status: action === 'approve' ? 'OPEN' : 'REJECTED'
    }
  });
  revalidatePath('/dashboard/admin/requests');
}

export default async function AdminRequests() {
  await requireRole(['ADMIN']);
  const requests = await prisma.request.findMany({
    include: { client: { include: { profile: true } }, category: true },
    orderBy: [{ moderationStatus: 'asc' }, { createdAt: 'desc' }]
  });

  const pending = requests.filter((r) => r.moderationStatus === 'PENDING');
  const rest = requests.filter((r) => r.moderationStatus !== 'PENDING');

  return (
    <div className="space-y-4">
      <SectionHeader title="Requests" subtitle={`${pending.length} pending review · ${requests.length} total`} />

      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-amber-700">Needs Review ({pending.length})</p>
          {pending.map((r) => (
            <Card key={r.id} className="border-amber-200 bg-amber-50">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{r.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{r.client.profile?.fullName ?? r.client.email} · {r.category.name}</p>
                  <p className="mt-1 text-sm text-slate-700 line-clamp-2">{r.description}</p>
                </div>
                <UrgencyBadge urgency={r.urgency} />
              </div>
              <form action={moderateRequest} className="mt-3 flex gap-2">
                <input type="hidden" name="id" value={r.id} />
                <Button type="submit" name="action" value="approve" size="sm">Approve</Button>
                <Button type="submit" name="action" value="reject" size="sm" variant="danger">Reject</Button>
              </form>
            </Card>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">All Other Requests</p>
          {rest.map((r) => (
            <Card key={r.id} className="hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{r.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{r.client.profile?.fullName ?? r.client.email} · {r.category.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <UrgencyBadge urgency={r.urgency} />
                  <StatusBadge status={r.status} />
                  <StatusBadge status={r.moderationStatus} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
