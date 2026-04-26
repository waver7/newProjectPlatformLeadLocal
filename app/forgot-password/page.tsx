import { Card } from '@/components/ui';
import { ForgotPasswordForm } from './reset-request-form';

export default function ForgotPasswordPage() {
  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Forgot password</h1>
      <p className="mt-2 text-sm text-slate-600">Enter your account email. We&apos;ll send a password reset link.</p>
      <div className="mt-4">
        <ForgotPasswordForm />
      </div>
    </Card>
  );
}
