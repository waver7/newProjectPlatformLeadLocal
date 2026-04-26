import { registerAction } from '@/app/actions/auth-actions';
import { Button, Card } from '@/components/ui';

export default function RegisterPage() {
  return <Card className="max-w-md mx-auto"><h1 className="text-xl font-semibold mb-4">Create account</h1><form action={registerAction} className="space-y-3"><input name="fullName" className="w-full border p-2 rounded" placeholder="Full name" /><input name="email" className="w-full border p-2 rounded" placeholder="Email" /><input name="password" type="password" className="w-full border p-2 rounded" placeholder="Password" /><select name="role" className="w-full border p-2 rounded"><option value="CLIENT">Client</option><option value="CONTRACTOR">Contractor</option></select><Button type="submit">Create account</Button></form></Card>;
}
