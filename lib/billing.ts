import { prisma } from './prisma';

export async function hasActiveSubscription(userId: string) {
  const now = new Date();
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE', startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { endsAt: 'desc' }
  });
  return !!sub;
}

export async function createMockSubscription(userId: string) {
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  return prisma.subscription.create({
    data: { userId, status: 'ACTIVE', planCode: 'pro-monthly', amountCents: 2000, startsAt: now, endsAt: end, provider: 'mock' }
  });
}
