import { loginAction } from '@/app/actions/auth-actions';
import { Button, Card } from '@/components/ui';

export default function LoginPage() {
  return <Card className="max-w-md mx-auto"><h1 className="text-xl font-semibold mb-4">Login</h1><form action={loginAction} className="space-y-3"><input name="email" className="w-full border p-2 rounded" placeholder="Email" /><input name="password" type="password" className="w-full border p-2 rounded" placeholder="Password" /><Button type="submit">Sign in</Button></form></Card>;
}
