import { redirect } from 'next/navigation';
import { auth } from './auth';

export async function requireRole(roles: string[]) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!roles.includes(session.user.role)) redirect('/');
  return session;
}
