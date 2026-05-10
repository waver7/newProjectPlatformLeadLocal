'use server';

import { auth } from '@/auth';
import { moderateText } from '@/lib/moderation';
import { prisma } from '@/lib/prisma';
import { messageSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export type MessageActionState = {
  error: string | null;
  success?: string | null;
};

export async function sendMessageAction(_prevState: MessageActionState, formData: FormData): Promise<MessageActionState> {
  const session = await auth();
  if (!session?.user) return { error: 'Unauthorized' };

  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid message' };

  const conv = await prisma.conversation.findUnique({
    where: { id: parsed.data.conversationId },
    include: { bid: { include: { request: true } } }
  });
  if (!conv || ![conv.clientId, conv.contractorId].includes(session.user.id)) {
    return { error: 'Conversation not found' };
  }

  const moderation = moderateText(parsed.data.content);
  const awardAllowsContact = conv.bid.request.awardedBidId === conv.bidId;

  if ((moderation.status === 'FLAGGED' || moderation.status === 'REJECTED') && !awardAllowsContact) {
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: session.user.id,
        content: parsed.data.content,
        status: 'BLOCKED',
        moderationStatus: 'FLAGGED',
        moderationLogs: {
          create: { targetType: 'MESSAGE', status: 'FLAGGED', reason: moderation.reason, actorUserId: session.user.id }
        }
      }
    });
    return { error: 'Message blocked: contact details cannot be shared before the bid is awarded.' };
  }

  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: session.user.id,
      content: parsed.data.content,
      status: 'SENT',
      moderationStatus: moderation.status,
      ...(moderation.status !== 'APPROVED' && {
        moderationLogs: {
          create: { targetType: 'MESSAGE', status: moderation.status, reason: moderation.reason, actorUserId: session.user.id }
        }
      })
    }
  });

  revalidatePath(`/dashboard/client/conversation/${conv.id}`);
  revalidatePath(`/dashboard/contractor/conversation/${conv.id}`);

  return { error: null, success: 'Message sent.' };
}
