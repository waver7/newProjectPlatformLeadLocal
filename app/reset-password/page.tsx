import { Card } from '@/components/ui';
import { ResetPasswordForm } from './reset-password-form';

export default function ResetPasswordPage({ searchParams }: { searchParams?: { token?: string } }) {
  const token = searchParams?.token ?? '';

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Reset password</h1>
      <p className="mt-2 text-sm text-slate-600">Set a new password for your account.</p>
      <div className="mt-4">
        <ResetPasswordForm token={token} />
      </div>
    </Card>
  );
}
