import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

export default async function AdminMessages() {
  await requireRole(['ADMIN']);
  const messages = await prisma.message.findMany({ include: { sender: true, conversation: { include: { request: true } } }, orderBy: { createdAt: 'desc' } });
  return <div className="space-y-2">{messages.map((m)=><Card key={m.id}><p className="text-sm">{m.sender.email} on {m.conversation.request.title}</p><p>{m.content}</p><p className="text-xs">{m.status} / {m.moderationStatus}</p></Card>)}</div>;
}
