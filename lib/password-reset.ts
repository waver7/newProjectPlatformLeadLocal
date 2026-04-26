import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function issuePasswordResetToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt }
  });

  return rawToken;
}

export async function consumePasswordResetToken(rawToken: string, password: string) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const token = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!token || token.usedAt || token.expiresAt < new Date()) return false;

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } })
  ]);

  return true;
}
