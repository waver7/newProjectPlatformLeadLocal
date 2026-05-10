import Link from 'next/link';
import { Card } from '@/components/ui';
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Join LocalTaskHub for free — no credit card required</p>
        </div>

        <Card>
          <RegisterForm />
        </Card>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
