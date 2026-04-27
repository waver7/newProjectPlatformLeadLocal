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
    <header className="border-b bg-white">
      <div className="container-app flex items-center justify-between py-3">
        <Link href="/" className="font-semibold text-slate-900">
          LocalTaskHub
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/requests">Find Jobs</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href={dashboardHref}>Dashboard</Link>
          {session?.user ? (
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button className="text-red-600">Logout</button>
            </form>
          ) : (
            <Link href="/register">Join</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
