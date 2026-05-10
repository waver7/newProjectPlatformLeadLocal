import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function DashboardRedirect() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  if (session.user.role === 'CLIENT') redirect('/dashboard/client');
  if (session.user.role === 'CONTRACTOR') redirect('/dashboard/contractor');
  if (session.user.role === 'ADMIN') redirect('/dashboard/admin');

  redirect('/');
}
