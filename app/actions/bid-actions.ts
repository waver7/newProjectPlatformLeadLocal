'use server';

import { auth } from '@/auth';
import { hasActiveSubscription } from '@/lib/billing';
import { getSettings } from '@/lib/data';
import { sendClientNewBidEmail } from '@/lib/email';
import { moderateText } from '@/lib/moderation';
import { prisma } from '@/lib/prisma';
import { bidSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export type BidActionState = {
  error: string | null;
  success?: string | null;
};

export async function placeBidAction(_prevState: BidActionState, formData: FormData): Promise<BidActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'CONTRACTOR') return { error: 'Unauthorized', success: null };
  const parsed = bidSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input', success: null };

  const settings = await getSettings();
  if (settings.requireContractorSubscription) {
    const active = await hasActiveSubscription(session.user.id);
    if (!active) return { error: 'Active subscription required to bid.', success: null };
  }

  const req = await prisma.request.findUnique({
    where: { id: parsed.data.requestId },
    include: { client: { include: { clientProfile: true } } }
  });
  if (!req || req.status !== 'OPEN') return { error: 'Request unavailable', success: null };

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
      moderationLogs: {
        create: { targetType: 'BID', status: moderation.status, reason: moderation.reason, actorUserId: session.user.id }
      }
    }
  });

  await prisma.conversation.create({ data: { requestId: req.id, bidId: bid.id, clientId: req.clientId, contractorId: session.user.id } });
  await prisma.notification.create({
    data: {
      userId: req.clientId,
      type: 'NEW_BID',
      title: 'New bid received',
      body: `You received a new bid on ${req.title}`,
      href: `/dashboard/client/requests/${req.id}`
    }
  });

  if (req.client.clientProfile?.emailPrivate) {
    await sendClientNewBidEmail({
      to: req.client.clientProfile.emailPrivate,
      requestTitle: req.title,
      amount: parsed.data.amount,
      timeline: parsed.data.estimatedTimeline,
      message: parsed.data.message
    });
  }

  revalidatePath(`/dashboard/contractor/requests/${req.id}`);
  revalidatePath(`/dashboard/client/requests/${req.id}`);

  return { error: null, success: 'Bid placed successfully.' };
}
