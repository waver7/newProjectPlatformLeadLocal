import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, Badge, Alert } from '@/components/ui';
import { SendMessageForm } from '@/components/send-message-form';

export default async function ClientConversationPage({ params }: { params: { convId: string } }) {
  const session = await requireRole(['CLIENT']);

  const conv = await prisma.conversation.findUnique({
    where: { id: params.convId },
    include: {
      bid: true,
      request: { include: { category: true } },
      messages: {
        where: { status: { not: 'BLOCKED' } },
        orderBy: { createdAt: 'asc' },
        include: { sender: { include: { profile: true } } }
      }
    }
  });

  if (!conv || conv.clientId !== session.user.id) notFound();

  const isAwarded = conv.isAwarded;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/dashboard/client/requests/${conv.request.id}`} className="text-sm text-brand-600 hover:underline">
            ← Back to request
          </Link>
          <h1 className="mt-1 text-xl font-bold">{conv.request.title}</h1>
          <p className="text-sm text-slate-500">{conv.request.category.name} · Bid: ${conv.bid.amount}</p>
        </div>
        <Badge variant={isAwarded ? 'success' : 'info'}>{isAwarded ? 'Awarded' : 'Bidding'}</Badge>
      </div>

      {!isAwarded && (
        <Alert variant="info">
          Contact details are protected until you award this bid. You can message freely once a contractor is selected.
        </Alert>
      )}

      {/* Messages */}
      <Card className="min-h-[360px] space-y-3">
        {conv.messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">No messages yet. Start the conversation!</p>
        )}
        {conv.messages.map((msg) => {
          const isMe = msg.senderId === session.user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                isMe
                  ? 'rounded-br-sm bg-brand-600 text-white'
                  : 'rounded-bl-sm bg-slate-100 text-slate-900'
              }`}>
                {!isMe && (
                  <p className="mb-0.5 text-xs font-medium text-slate-500">
                    {msg.sender.profile?.fullName ?? msg.sender.email}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`mt-1 text-right text-[10px] ${isMe ? 'text-brand-200' : 'text-slate-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Send form */}
      <Card>
        <SendMessageForm conversationId={conv.id} />
      </Card>
    </div>
  );
}
