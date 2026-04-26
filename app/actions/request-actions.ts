'use server';

import { auth } from '@/auth';
import { getSettings } from '@/lib/data';
import { sendContractorAwardEmail } from '@/lib/email';
import { moderateText } from '@/lib/moderation';
import { prisma } from '@/lib/prisma';
import { requestSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createRequestAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'CLIENT') return { error: 'Unauthorized' };
  const parsed = requestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const settings = await getSettings();
  const cp = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
  if (!cp) return { error: 'Client profile missing' };
  if (cp.freePostsUsed >= settings.freePostLimit) return { error: `Free post limit reached (${settings.freePostLimit}).` };

  const moderation = moderateText(`${parsed.data.title} ${parsed.data.description}`);
  const req = await prisma.request.create({
    data: {
      clientId: session.user.id,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      description: parsed.data.description,
      city: parsed.data.city,
      zipCode: parsed.data.zipCode,
      urgency: parsed.data.urgency,
      budget: parsed.data.budget,
      preferredDate: parsed.data.preferredDate ? new Date(parsed.data.preferredDate) : undefined,
      status: moderation.status === 'REJECTED' ? 'REJECTED' : moderation.status === 'FLAGGED' ? 'PENDING_MODERATION' : 'OPEN',
      moderationStatus: moderation.status,
      moderationLogs: {
        create: { targetType: 'REQUEST', status: moderation.status, reason: moderation.reason, actorUserId: session.user.id }
      }
    }
  });

  await prisma.clientProfile.update({
    where: { userId: session.user.id },
    data: {
      phonePrivate: parsed.data.phonePrivate,
      emailPrivate: parsed.data.emailPrivate,
      freePostsUsed: { increment: 1 }
    }
  });
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
  if (!request || request.clientId !== session.user.id || request.status !== 'OPEN') return { error: 'Request not eligible' };
  const selected = request.bids.find((b) => b.id === bidId);
  if (!selected) return { error: 'Bid not found' };

  await prisma.$transaction([
    prisma.bid.updateMany({ where: { requestId, id: { not: bidId } }, data: { status: 'REJECTED' } }),
    prisma.bid.update({ where: { id: bidId }, data: { status: 'ACCEPTED', isWinner: true } }),
    prisma.request.update({ where: { id: requestId }, data: { status: 'AWARDED', awardedBidId: bidId } }),
    prisma.notification.create({
      data: {
        userId: selected.contractorId,
        type: 'BID_ACCEPTED',
        title: 'Your bid was accepted',
        body: `You won the bid for ${request.title}`,
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
