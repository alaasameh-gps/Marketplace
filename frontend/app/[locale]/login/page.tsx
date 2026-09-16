'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useLocale } from '@/lib/use-locale';
import { useAuth } from '@/hooks/use-auth';
import { Button, Field, Input, Alert, Card } from '@/components/ui';
import { ShieldCheckIcon } from '@/components/ui/icons';

export default function LoginPage() {
  const { locale, dict } = useLocale();
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      const dest = user.role === 'admin' ? `/${locale}/admin` : user.role === 'vendor' ? `/${locale}/vendor` : `/${locale}/account`;
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center py-4">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
          <ShieldCheckIcon className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{dict.auth.loginTitle}</h1>
          <p className="mt-1 text-sm text-neutral-500">{dict.auth.loginSubtitle ?? dict.auth.email}</p>
        </div>
      </div>

      <Card className="w-full rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <Alert tone="error">{error}</Alert> : null}
          <Field label={dict.auth.email}>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>
          <Field label={dict.auth.password}>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <Button type="submit" loading={loading} className="w-full" size="lg">
            {dict.auth.signIn}
          </Button>
        </form>
        <p className="mt-4 text-sm text-neutral-500">
          {dict.auth.noAccount}{' '}
          <Link href={`/${locale}/register`} className="font-medium text-blue-700 hover:underline">
            {dict.auth.createAccount}
          </Link>
        </p>
      </Card>
    </div>
  );
}