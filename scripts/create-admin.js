/**
 * Creates (or updates) an ADMIN user.
 *
 * Usage:
 *   node scripts/create-admin.js <username> <password> <email> [fullName]
 *
 * Example:
 *   node scripts/create-admin.js admin Admin123! waverstudio@gmail.com "Site Admin"
 *
 * If the username already exists, its password is reset and role set to ADMIN.
 */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const username = (process.argv[2] || '').trim().toLowerCase();
  const password = process.argv[3] || '';
  const email = (process.argv[4] || '').trim().toLowerCase();
  const fullName = process.argv[5] || 'Site Admin';

  if (!username || !password || !email) {
    console.error('Usage: node scripts/create-admin.js <username> <password> <email> [fullName]');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
      email,
      role: 'ADMIN',
      isActive: true,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      username,
      email,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      emailVerified: new Date(),
      agreedToTermsAt: new Date(),
      profile: { create: { fullName } },
    },
  });

  console.log(`Admin ready: ${user.username} <${user.email}> (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
