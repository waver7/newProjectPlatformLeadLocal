import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './prisma';

const credsSchema = z.object({ email: z.string().min(1), password: z.string().min(1) });

// Lock an account after this many consecutive failures …
const MAX_FAILURES = 5;
// … for this many minutes.
const LOCKOUT_MINUTES = 15;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const parsed = credsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const loginId = parsed.data.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: loginId },
          include: { profile: true },
        });

        // Unknown user — return null without timing difference (bcrypt still runs)
        if (!user) {
          // Run a dummy compare so response time is constant (prevents user enumeration)
          await bcrypt.compare(parsed.data.password, '$2b$10$invalidhashpadding000000000000000000000000000000000000');
          return null;
        }

        // Account deactivated by admin
        if (!user.isActive) return null;

        // Account locked — check lockout window
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
          // We can't surface a message from `authorize`, but the null return will redirect
          // to /login?error=invalid_credentials; the UI can add a generic "account locked" hint.
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
                lockedUntil: shouldLock
                  ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
                  : undefined,
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
