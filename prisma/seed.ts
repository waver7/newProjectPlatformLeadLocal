import { PrismaClient, Role, Urgency } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categoryNames = ['Plumbing', 'Electrical', 'HVAC', 'Handyman', 'Painting', 'Cleaning', 'Landscaping', 'Moving', 'Junk Removal', 'Flooring', 'Roofing', 'Beauty', 'Fitness', 'Personal Training', 'Auto Services', 'Appliance Repair', 'General Labor'];

async function createUser(email: string, role: Role, name: string, password = 'Password123!') {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      profile: { create: { fullName: name, city: 'Austin' } },
      clientProfile: role === 'CLIENT' ? { create: { phonePrivate: '555-111-2233', emailPrivate: email } } : undefined,
      contractorProfile: role === 'CONTRACTOR' ? { create: { businessName: `${name} Services`, serviceArea: 'Austin Metro', bio: 'Licensed local contractor', phone: '555-333-4455', email } } : undefined,
      creditWallet: { create: { balance: 20 } }
    }
  });
}

async function main() {
  await prisma.moderationLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.request.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.contractorProfile.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.creditWallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adminSettings.deleteMany();

  const categories = [];
  for (const name of categoryNames) {
    categories.push(await prisma.category.create({ data: { name, slug: name.toLowerCase().replace(/\s+/g, '-') } }));
  }

  const admin = await createUser('admin@leadlocal.dev', 'ADMIN', 'Platform Admin');
  await createUser('admin', 'ADMIN', 'Admin Simple Login', '123');
  const clients = await Promise.all([
    createUser('client1@leadlocal.dev', 'CLIENT', 'Client One'),
    createUser('client2@leadlocal.dev', 'CLIENT', 'Client Two'),
    createUser('client3@leadlocal.dev', 'CLIENT', 'Client Three')
  ]);
  const contractors = await Promise.all([
    createUser('contractor1@leadlocal.dev', 'CONTRACTOR', 'Contractor One'),
    createUser('contractor2@leadlocal.dev', 'CONTRACTOR', 'Contractor Two'),
    createUser('contractor3@leadlocal.dev', 'CONTRACTOR', 'Contractor Three')
  ]);

  for (const c of contractors) {
    const now = new Date();
    const end = new Date(now); end.setMonth(end.getMonth() + 1);
    await prisma.subscription.create({ data: { userId: c.id, status: 'ACTIVE', planCode: 'pro-monthly', amountCents: 2000, startsAt: now, endsAt: end } });
  }

  const requests = [];
  for (let i = 0; i < 18; i++) {
    const client = clients[i % clients.length];
    const category = categories[i % categories.length];
    requests.push(await prisma.request.create({
      data: {
        clientId: client.id,
        categoryId: category.id,
        title: `${category.name} help needed #${i + 1}`,
        description: `Need a reliable ${category.name.toLowerCase()} contractor for local project.`,
        city: i % 2 ? 'Austin' : 'Round Rock',
        urgency: [Urgency.LOW, Urgency.MEDIUM, Urgency.HIGH][i % 3],
        status: 'OPEN',
        moderationStatus: 'APPROVED'
      }
    }));
  }

  const awardedReq = requests[0];
  const winningBid = await prisma.bid.create({ data: { requestId: awardedReq.id, contractorId: contractors[0].id, amount: 450, message: 'Can start tomorrow', estimatedTimeline: '2 days', status: 'ACCEPTED', moderationStatus: 'APPROVED', isWinner: true } });
  await prisma.request.update({ where: { id: awardedReq.id }, data: { status: 'AWARDED', awardedBidId: winningBid.id } });

  const otherBid = await prisma.bid.create({ data: { requestId: requests[1].id, contractorId: contractors[1].id, amount: 300, message: 'DM me on WhatsApp', estimatedTimeline: '3 days', status: 'FLAGGED', moderationStatus: 'FLAGGED' } });

  const conv = await prisma.conversation.create({ data: { requestId: requests[1].id, bidId: otherBid.id, clientId: requests[1].clientId, contractorId: contractors[1].id } });
  await prisma.message.create({ data: { conversationId: conv.id, senderId: contractors[1].id, content: 'Contact me via Telegram', status: 'BLOCKED', moderationStatus: 'FLAGGED' } });

  await prisma.notification.createMany({ data: [
    { userId: clients[0].id, type: 'NEW_BID', title: 'New bid', body: 'You have a new bid.' },
    { userId: contractors[0].id, type: 'BID_ACCEPTED', title: 'Bid accepted', body: 'Congrats, you won.' },
    { userId: contractors[2].id, type: 'SUBSCRIPTION_EXPIRED', title: 'Subscription warning', body: 'Renew your subscription soon.' }
  ]});

  await prisma.adminSettings.create({ data: { freePostLimit: 5, requireContractorSubscription: true, requireBidCredits: false } });

  await prisma.moderationLog.createMany({ data: [
    { targetType: 'BID', bidId: otherBid.id, status: 'FLAGGED', reason: 'Contact sharing attempt', actorUserId: contractors[1].id },
    { targetType: 'REQUEST', requestId: requests[2].id, status: 'APPROVED', reason: 'Clean content', actorUserId: admin.id }
  ]});

  console.log('Seed complete');
}

main().finally(() => prisma.$disconnect());
