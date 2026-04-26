import Link from 'next/link';
import { auth, signOut } from '@/auth';

export async function Nav() {
  const session = await auth();
  return (
    <header className="border-b bg-white">
      <div className="container-app flex items-center justify-between py-3">
        <Link href="/" className="font-semibold">LeadLocal</Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/requests">Browse Requests</Link>
          <Link href="/pricing">Pricing</Link>
          {session?.user ? (
            <>
              <Link href={session.user.role === 'CLIENT' ? '/dashboard/client' : session.user.role === 'CONTRACTOR' ? '/dashboard/contractor' : '/dashboard/admin'}>Dashboard</Link>
              <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
                <button className="text-red-600">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
