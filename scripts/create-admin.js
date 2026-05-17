/**
 * Creates (or updates) an ADMIN user.
 *
 * Usage:
 *   node scripts/create-admin.js <email> <password> [fullName]
 *
 * Example:
 *   node scripts/create-admin.js admin@leadlocal.dev Admin123! "Site Admin"
 *
 * If the email already exists, its password is reset and role set to ADMIN.
 */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  const password = process.argv[3] || '';
  const fullName = process.argv[4] || 'Site Admin';

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <password> [fullName]');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      emailVerified: new Date(),
      agreedToTermsAt: new Date(),
      profile: { create: { fullName } },
    },
  });

  console.log(`Admin ready: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
