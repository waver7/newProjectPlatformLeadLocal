import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, SectionHeader, Badge } from '@/components/ui';
import { revalidatePath } from 'next/cache';

async function toggleUser(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const isActive = formData.get('isActive') === 'true';
  await prisma.user.update({ where: { id }, data: { isActive: !isActive } });
  revalidatePath('/dashboard/admin/users');
}

const roleColors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger' | 'purple'> = {
  ADMIN: 'purple',
  CLIENT: 'info',
  CONTRACTOR: 'success',
  GUEST: 'default'
};

export default async function AdminUsers() {
  await requireRole(['ADMIN']);
  const users = await prisma.user.findMany({
    include: { profile: true, _count: { select: { requests: true, bids: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-4">
      <SectionHeader title="Users" subtitle={`${users.length} total accounts`} />

      <div className="space-y-2">
        {users.map((u) => (
          <Card key={u.id} className={`transition-colors ${!u.isActive ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{u.profile?.fullName ?? '—'}</p>
                  <Badge variant={roleColors[u.role] ?? 'default'}>{u.role}</Badge>
                  {!u.isActive && <Badge variant="danger">Disabled</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>{u._count.requests} requests</span>
                <span>{u._count.bids} bids</span>
                <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                <form action={toggleUser}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="isActive" value={String(u.isActive)} />
                  <button className={`rounded px-2 py-1 text-xs font-medium ${u.isActive ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                    {u.isActive ? 'Disable' : 'Enable'}
                  </button>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
