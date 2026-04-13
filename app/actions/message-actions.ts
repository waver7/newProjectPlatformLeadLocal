'use server';

import { auth } from '@/auth';
import { moderateText } from '@/lib/moderation';
import { prisma } from '@/lib/prisma';
import { messageSchema } from '@/lib/schemas';

export async function sendMessageAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: 'Unauthorized' };
  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Invalid data' };

  const conv = await prisma.conversation.findUnique({ where: { id: parsed.data.conversationId }, include: { bid: { include: { request: true } } } });
  if (!conv || ![conv.clientId, conv.contractorId].includes(session.user.id)) return { error: 'Forbidden' };

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
        moderationLogs: { create: { targetType: 'MESSAGE', status: 'FLAGGED', reason: moderation.reason, actorUserId: session.user.id } }
      }
    });
    return { error: 'Message blocked: do not share contact details before award.' };
  }

  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: session.user.id,
      content: parsed.data.content,
      status: 'SENT',
      moderationStatus: moderation.status,
      moderationLogs: { create: { targetType: 'MESSAGE', status: moderation.status, reason: moderation.reason, actorUserId: session.user.id } }
    }
  });
  return { ok: true };
}
