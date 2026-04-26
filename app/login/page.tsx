import { loginAction } from '@/app/actions/auth-actions';
import { Button, Card } from '@/components/ui';

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

const errorMessageByCode: Record<string, string> = {
  invalid_credentials: 'Invalid login or password.',
  account_created_login_failed: 'Account created. Please sign in manually.',
  auth_failed: 'Authentication failed. Please try again.'
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorCode = searchParams?.error;
  const errorMessage = errorCode ? errorMessageByCode[errorCode] ?? errorMessageByCode.auth_failed : null;

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Login</h1>
      {errorMessage ? <p className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{errorMessage}</p> : null}
      <form action={loginAction} className="space-y-3">
        <input name="email" type="text" className="w-full rounded border p-2" placeholder="Email or username" required />
        <input name="password" type="password" className="w-full rounded border p-2" placeholder="Password" required />
        <Button type="submit">Sign in</Button>
      </form>
    </Card>
  );
}
