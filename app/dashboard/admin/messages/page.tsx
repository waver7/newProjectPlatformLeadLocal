import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, SectionHeader, StatusBadge } from '@/components/ui';

export default async function AdminMessages() {
  await requireRole(['ADMIN']);
  const messages = await prisma.message.findMany({
    include: { sender: { include: { profile: true } }, conversation: { include: { request: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const flagged = messages.filter((m) => m.status === 'BLOCKED' || m.moderationStatus === 'FLAGGED');
  const rest = messages.filter((m) => m.status !== 'BLOCKED' && m.moderationStatus !== 'FLAGGED');

  return (
    <div className="space-y-4">
      <SectionHeader title="Messages" subtitle={`${flagged.length} flagged · ${messages.length} total`} />

      {flagged.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-amber-700">Flagged / Blocked</p>
          {flagged.map((m) => (
            <Card key={m.id} className="border-amber-200 bg-amber-50">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {m.sender.profile?.fullName ?? m.sender.email}
                    <span className="ml-1 text-slate-500 font-normal">on "{m.conversation.request.title}"</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{m.content}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={m.status} />
                  <span className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500">Recent Messages</p>
        {rest.slice(0, 50).map((m) => (
          <Card key={m.id} className="hover:border-slate-300 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-500">
                  <span className="font-medium text-slate-900">{m.sender.profile?.fullName ?? m.sender.email}</span>
                  {' on "'}{m.conversation.request.title}{'"'}
                </p>
                <p className="mt-1 text-sm text-slate-700 line-clamp-2">{m.content}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{new Date(m.createdAt).toLocaleString()}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
