import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './prisma';

const credsSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });

const MAX_FAILURES = 5;
const LOCKOUT_MINUTES = 15;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      authorize: async (credentials) => {
        const parsed = credsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const loginId = parsed.data.username.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { username: loginId },
          include: { profile: true },
        });

        if (!user) {
          await bcrypt.compare(parsed.data.password, '$2b$10$invalidhashpadding000000000000000000000000000000000000');
          return null;
        }

        if (!user.isActive) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
          console.warn(`[auth] Account locked: ${loginId} — ${remaining} min remaining`);
          return null;
        }

        const passwordOk = await bcrypt.compare(parsed.data.password, user.passwordHash);

        if (!passwordOk) {
          const newCount = user.failedLoginAttempts + 1;
          const shouldLock = newCount >= MAX_FAILURES;
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: newCount,
                lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000) : undefined,
              },
            });
          } catch (e) {
            console.error('[auth] Failed to update login failure counter:', e);
          }
          return null;
        }

        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        } catch (e) {
          console.error('[auth] Failed to reset login failure counter:', e);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.fullName ?? user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
