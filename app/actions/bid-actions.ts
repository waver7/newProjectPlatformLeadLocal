'use server';

import { auth } from '@/auth';
import { hasActiveSubscription } from '@/lib/billing';
import { getSettings } from '@/lib/data';
import { moderateText } from '@/lib/moderation';
import { prisma } from '@/lib/prisma';
import { bidSchema } from '@/lib/schemas';

export async function placeBidAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'CONTRACTOR') return { error: 'Unauthorized' };
  const parsed = bidSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const settings = await getSettings();
  if (settings.requireContractorSubscription) {
    const active = await hasActiveSubscription(session.user.id);
    if (!active) return { error: 'Active subscription required to bid.' };
  }

  const req = await prisma.request.findUnique({ where: { id: parsed.data.requestId } });
  if (!req || req.status !== 'OPEN') return { error: 'Request unavailable' };

  const moderation = moderateText(parsed.data.message);
  const bid = await prisma.bid.create({
    data: {
      requestId: parsed.data.requestId,
      contractorId: session.user.id,
      amount: parsed.data.amount,
      estimatedTimeline: parsed.data.estimatedTimeline,
      message: parsed.data.message,
      status: moderation.status === 'FLAGGED' ? 'FLAGGED' : 'SUBMITTED',
      moderationStatus: moderation.status,
      moderationLogs: { create: { targetType: 'BID', status: moderation.status, reason: moderation.reason, actorUserId: session.user.id } }
    }
  });

  await prisma.conversation.create({ data: { requestId: req.id, bidId: bid.id, clientId: req.clientId, contractorId: session.user.id } });
  await prisma.notification.create({ data: { userId: req.clientId, type: 'NEW_BID', title: 'New bid received', body: `You received a new bid on ${req.title}`, href: `/dashboard/client/requests/${req.id}` } });
  return { ok: true };
}
