import { PrismaClient, Role, Urgency } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categoryNames = ['Plumbing', 'Electrical', 'HVAC', 'Handyman', 'Painting', 'Cleaning', 'Landscaping', 'Moving', 'Junk Removal', 'Flooring', 'Roofing', 'Beauty', 'Fitness', 'Personal Training', 'Auto Services', 'Appliance Repair', 'General Labor'];

type DemoUser = { email: string; role: Role; name: string; password?: string };

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

  const demoUsers: DemoUser[] = [
    { email: 'admin@leadlocal.dev', role: 'ADMIN', name: 'Platform Admin', password: 'Password123!' },
    { email: 'admin', role: 'ADMIN', name: 'Admin Simple Login', password: '123' },
    { email: 'client1@leadlocal.dev', role: 'CLIENT', name: 'Client One', password: 'Password123!' },
    { email: 'client2@leadlocal.dev', role: 'CLIENT', name: 'Client Two', password: 'Password123!' },
    { email: 'client.demo', role: 'CLIENT', name: 'Client Demo', password: '123456' },
    { email: 'contractor1@leadlocal.dev', role: 'CONTRACTOR', name: 'Contractor One', password: 'Password123!' },
    { email: 'contractor2@leadlocal.dev', role: 'CONTRACTOR', name: 'Contractor Two', password: 'Password123!' },
    { email: 'contractor.demo', role: 'CONTRACTOR', name: 'Contractor Demo', password: '123456' }
  ];

  const createdUsers = await Promise.all(demoUsers.map((u) => createUser(u.email, u.role, u.name, u.password)));
  const admin = createdUsers.find((u) => u.role === 'ADMIN' && u.email === 'admin@leadlocal.dev')!;
  const clients = createdUsers.filter((u) => u.role === 'CLIENT');
  const contractors = createdUsers.filter((u) => u.role === 'CONTRACTOR');

  for (const contractor of contractors) {
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);
    await prisma.subscription.create({
      data: {
        userId: contractor.id,
        status: 'ACTIVE',
        planCode: 'pro-monthly',
        amountCents: 2000,
        startsAt: now,
        endsAt: end
      }
    });
  }

  const requestTemplates = [
    { title: 'Fix leaking kitchen sink', description: 'Need plumber to repair under-sink leak in my apartment kitchen.' },
    { title: 'Install new ceiling lights', description: 'Need electrician to replace two old lights with LED fixtures.' },
    { title: 'Deep clean 2-bedroom apartment', description: 'Need cleaning service this weekend for move-out ready cleaning.' }
  ];

  const requests = [];
  for (let i = 0; i < 18; i++) {
    const client = clients[i % clients.length];
    const category = categories[i % categories.length];
    const template = requestTemplates[i % requestTemplates.length];

    requests.push(
      await prisma.request.create({
        data: {
          clientId: client.id,
          categoryId: category.id,
          title: i < requestTemplates.length ? template.title : `${category.name} help needed #${i + 1}`,
          description: i < requestTemplates.length ? template.description : `Need a reliable ${category.name.toLowerCase()} contractor for local project.`,
          city: i % 2 ? 'Austin' : 'Round Rock',
          urgency: [Urgency.LOW, Urgency.MEDIUM, Urgency.HIGH][i % 3],
          status: 'OPEN',
          moderationStatus: 'APPROVED'
        }
      })
    );
  }

  const awardedReq = requests[0];
  const winningBid = await prisma.bid.create({
    data: {
      requestId: awardedReq.id,
      contractorId: contractors[0].id,
      amount: 450,
      message: 'Can start tomorrow',
      estimatedTimeline: '2 days',
      status: 'ACCEPTED',
      moderationStatus: 'APPROVED',
      isWinner: true
    }
  });
  await prisma.request.update({ where: { id: awardedReq.id }, data: { status: 'AWARDED', awardedBidId: winningBid.id } });

  const otherBid = await prisma.bid.create({
    data: {
      requestId: requests[1].id,
      contractorId: contractors[1].id,
      amount: 300,
      message: 'DM me on WhatsApp',
      estimatedTimeline: '3 days',
      status: 'FLAGGED',
      moderationStatus: 'FLAGGED'
    }
  });

  const conv = await prisma.conversation.create({ data: { requestId: requests[1].id, bidId: otherBid.id, clientId: requests[1].clientId, contractorId: contractors[1].id } });
  await prisma.message.create({ data: { conversationId: conv.id, senderId: contractors[1].id, content: 'Contact me via Telegram', status: 'BLOCKED', moderationStatus: 'FLAGGED' } });

  await prisma.notification.createMany({
    data: [
      { userId: clients[0].id, type: 'NEW_BID', title: 'New bid', body: 'You have a new bid.' },
      { userId: contractors[0].id, type: 'BID_ACCEPTED', title: 'Bid accepted', body: 'Congrats, you won.' },
      { userId: contractors[contractors.length - 1].id, type: 'SUBSCRIPTION_EXPIRED', title: 'Subscription warning', body: 'Renew your subscription soon.' }
    ]
  });

  await prisma.adminSettings.create({ data: { freePostLimit: 5, requireContractorSubscription: true, requireBidCredits: false } });

  await prisma.moderationLog.createMany({
    data: [
      { targetType: 'BID', bidId: otherBid.id, status: 'FLAGGED', reason: 'Contact sharing attempt', actorUserId: contractors[1].id },
      { targetType: 'REQUEST', requestId: requests[2].id, status: 'APPROVED', reason: 'Clean content', actorUserId: admin.id }
    ]
  });

  console.log('Seed complete with demo accounts and active contractor subscriptions.');
}

main().finally(() => prisma.$disconnect());
