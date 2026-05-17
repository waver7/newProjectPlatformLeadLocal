'use server';

import { auth } from '@/auth';
import { getSettings } from '@/lib/data';
import { sendContractorAwardEmail } from '@/lib/email';
import { lookupZip } from '@/lib/geo';
import { checkClientCanPost } from '@/lib/billing';
import { moderateText } from '@/lib/moderation';
import { prisma } from '@/lib/prisma';
import { requestSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type RequestActionState = {
  error: string | null;
  success?: string | null;
};

const editRequestSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  city: z.string().min(2, 'City required'),
  description: z.string().min(20, 'Description must be at least 20 characters')
});

export async function createRequestAction(_prevState: RequestActionState, formData: FormData): Promise<RequestActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'CLIENT') return { error: 'Unauthorized', success: null };

  const parsed = requestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input', success: null };

  const [settings, billingAccess] = await Promise.all([
    getSettings(),
    checkClientCanPost(session.user.id),
  ]);

  if (billingAccess.allowed) {
    // Subscribed / trial user — just update contact info (no free-post counter)
    await prisma.clientProfile.update({
      where: { userId: session.user.id },
      data: { phonePrivate: parsed.data.phonePrivate, emailPrivate: parsed.data.emailPrivate },
    });
  } else if (billingAccess.reason === 'no_subscription') {
    // No subscription → fall back to the admin-configurable free-post limit
    const updated = await prisma.clientProfile.updateMany({
      where: { userId: session.user.id, freePostsUsed: { lt: settings.freePostLimit } },
      data: {
        freePostsUsed: { increment: 1 },
        phonePrivate: parsed.data.phonePrivate,
        emailPrivate: parsed.data.emailPrivate,
      },
    });
    if (updated.count === 0) {
      return {
        error: `You've used all ${settings.freePostLimit} free post${settings.freePostLimit !== 1 ? 's' : ''}. Subscribe to keep posting.`,
        success: null,
      };
    }
  } else {
    // quota_exceeded — subscription active but monthly limit reached
    return {
      error: "You have reached your plan's monthly request limit. Upgrade to post more.",
      success: null,
    };
  }

  const moderation = moderateText(`${parsed.data.title} ${parsed.data.description}`);

  // FLAGGED = contact info detected → reject the form so the user can remove it
  if (moderation.status === 'FLAGGED') {
    return {
      error: 'Your title or description appears to contain a phone number, email, or social handle. Please remove contact details — they will be shared with the winning contractor only after award.',
      success: null
    };
  }

  // REJECTED = prohibited keyword → send to admin review instead of auto-rejecting
  const requestStatus = moderation.status === 'APPROVED' ? 'OPEN' : 'PENDING_MODERATION';

  const coords = parsed.data.zipCode ? lookupZip(parsed.data.zipCode) : null;

  const req = await prisma.request.create({
    data: {
      clientId: session.user.id,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      description: parsed.data.description,
      city: parsed.data.city,
      state: parsed.data.state,
      zipCode: parsed.data.zipCode,
      latitude: coords?.lat ?? undefined,
      longitude: coords?.lon ?? undefined,
      urgency: parsed.data.urgency,
      budget: parsed.data.budget,
      preferredDate: parsed.data.preferredDate ? new Date(parsed.data.preferredDate) : undefined,
      status: requestStatus,
      moderationStatus: moderation.status,
      moderationLogs: {
        create: { targetType: 'REQUEST', status: moderation.status, reason: moderation.reason, actorUserId: session.user.id }
      }
    }
  });

  redirect(`/dashboard/client/requests/${req.id}`);
}

export async function updateRequestAction(_prevState: RequestActionState, formData: FormData): Promise<RequestActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'CLIENT') return { error: 'Unauthorized', success: null };

  const parsed = editRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input', success: null };

  const req = await prisma.request.findUnique({ where: { id: parsed.data.id } });
  if (!req || req.clientId !== session.user.id) return { error: 'Request not found', success: null };
  if (!['OPEN', 'PENDING_MODERATION', 'DRAFT'].includes(req.status)) {
    return { error: 'Only open or pending requests can be edited.', success: null };
  }

  const moderation = moderateText(`${parsed.data.title} ${parsed.data.description}`);

  if (moderation.status === 'FLAGGED') {
    return {
      error: 'Your title or description appears to contain a phone number, email, or social handle. Please remove contact details.',
      success: null
    };
  }

  const updatedStatus = moderation.status === 'APPROVED' ? 'OPEN' : 'PENDING_MODERATION';

  await prisma.request.update({
    where: { id: req.id },
    data: {
      title: parsed.data.title,
      city: parsed.data.city,
      description: parsed.data.description,
      status: updatedStatus,
      moderationStatus: moderation.status,
      moderationLogs: {
        create: { targetType: 'REQUEST', status: moderation.status, reason: moderation.reason, actorUserId: session.user.id }
      }
    }
  });

  revalidatePath(`/dashboard/client/requests/${req.id}`);
  revalidatePath(`/dashboard/client/requests/${req.id}/edit`);
  redirect(`/dashboard/client/requests/${req.id}`);
}

export async function awardBidAction(requestId: string, bidId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'CLIENT') return { error: 'Unauthorized' };

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      bids: { include: { contractor: { include: { contractorProfile: true } } } },
      client: { include: { clientProfile: true } }
    }
  });
  if (!request || request.clientId !== session.user.id || request.status !== 'OPEN') {
    return { error: 'Request not eligible for awarding' };
  }

  const selected = request.bids.find((b) => b.id === bidId);
  if (!selected) return { error: 'Bid not found' };

  await prisma.$transaction([
    prisma.bid.updateMany({ where: { requestId, id: { not: bidId } }, data: { status: 'REJECTED' } }),
    prisma.bid.update({ where: { id: bidId }, data: { status: 'ACCEPTED', isWinner: true } }),
    prisma.request.update({ where: { id: requestId }, data: { status: 'AWARDED', awardedBidId: bidId } }),
    prisma.conversation.updateMany({ where: { requestId }, data: { isAwarded: false } }),
    prisma.conversation.updateMany({ where: { bidId }, data: { isAwarded: true } }),
    prisma.notification.create({
      data: {
        userId: selected.contractorId,
        type: 'BID_ACCEPTED',
        title: 'Your bid was accepted!',
        body: `You won the bid for "${request.title}"`,
        href: `/dashboard/contractor/requests/${requestId}`
      }
    })
  ]);

  if (selected.contractor.contractorProfile?.email) {
    await sendContractorAwardEmail({
      to: selected.contractor.contractorProfile.email,
      requestTitle: request.title,
      clientEmail: request.client.clientProfile?.emailPrivate || request.client.email,
      clientPhone: request.client.clientProfile?.phonePrivate || undefined
    });
  }

  revalidatePath(`/dashboard/client/requests/${requestId}`);
  revalidatePath(`/dashboard/contractor/requests/${requestId}`);

  return { ok: true };
}
