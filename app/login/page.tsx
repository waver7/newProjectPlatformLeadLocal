import Link from 'next/link';
import { loginAction } from '@/app/actions/auth-actions';
import { Card, Button } from '@/components/ui';

type Props = { searchParams?: { error?: string; verified?: string } };

const errors: Record<string, string> = {
  invalid_credentials: 'Incorrect email or password. Please try again.',
  account_created_login_failed: 'Account created — please log in.',
  auth_failed: 'Something went wrong. Please try again.'
};

const successes: Record<string, string> = {
  verified: 'Email verified! Sign in to access your dashboard.'
};

export default function LoginPage({ searchParams }: Props) {
  const errorMsg = searchParams?.error ? (errors[searchParams.error] ?? errors.auth_failed) : null;
  const successMsg = searchParams?.verified ? successes.verified : null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your LocalTaskHub account</p>
        </div>

        <Card>
          {successMsg && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Email or username</label>
              <input
                name="email"
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="you@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
              </div>
              <input
                name="password"
                type="password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full justify-center">Sign in</Button>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">Join free</Link>
        </p>
      </div>
    </div>
  );
}
