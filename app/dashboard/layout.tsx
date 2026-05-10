import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  let showVerificationBanner = false;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    });
    showVerificationBanner = !user?.emailVerified;
  }

  return (
    <>
      {showVerificationBanner && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Please verify your email address.</span>{' '}
              We sent a 6-digit code to your email when you registered.
            </p>
            <Link
              href="/verify-email"
              className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-200"
            >
              Verify now →
            </Link>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
