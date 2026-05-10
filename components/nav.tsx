import Link from 'next/link';
import { auth, signOut } from '@/auth';

export async function Nav() {
  const session = await auth();
  const dashboardHref = session?.user
    ? session.user.role === 'CLIENT'
      ? '/dashboard/client'
      : session.user.role === 'CONTRACTOR'
        ? '/dashboard/contractor'
        : '/dashboard/admin'
    : '/login';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container-app flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-black text-white">L</span>
          <span>LocalTaskHub</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/requests" className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
            Find Jobs
          </Link>
          <Link href="/categories" className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
            Categories
          </Link>
          <Link href="/pricing" className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Link
                href={dashboardHref}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
