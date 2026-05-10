import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const CODE_EXPIRY_MINUTES = 15;

/** Generate a 6-digit OTP, store a bcrypt hash, return the plaintext code. */
export async function generateVerificationCode(userId: string): Promise<string> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60_000);

  // Replace any existing code for this user
  await prisma.emailVerificationCode.deleteMany({ where: { userId } });
  await prisma.emailVerificationCode.create({ data: { userId, codeHash, expiresAt } });

  return code;
}

/**
 * Verify the code submitted by the user.
 * On success: marks emailVerified on the User and deletes the code record.
 * Returns true on success, false if invalid or expired.
 */
export async function verifyEmailCode(userId: string, code: string): Promise<boolean> {
  const record = await prisma.emailVerificationCode.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
  });

  if (!record) return false;

  const valid = await bcrypt.compare(code.trim(), record.codeHash);
  if (!valid) return false;

  await prisma.$transaction([
    prisma.emailVerificationCode.deleteMany({ where: { userId } }),
    prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } }),
  ]);

  return true;
}
