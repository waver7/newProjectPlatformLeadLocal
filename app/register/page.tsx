import { Card } from '@/components/ui';
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <Card className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Create account</h1>
      <RegisterForm />
    </Card>
  );
}
