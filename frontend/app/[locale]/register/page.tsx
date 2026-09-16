'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useLocale } from '@/lib/use-locale';
import { useAuth } from '@/hooks/use-auth';
import { Button, Field, Input, Select, Alert, Card } from '@/components/ui';
import { UserIcon } from '@/components/ui/icons';
import type { Role } from '@/types';

export default function RegisterPage() {
  const { locale, dict } = useLocale();
  const { register, login } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await register({
        name,
        email,
        phone: phone || undefined,
        password,
        role,
        storeName: role === 'vendor' ? storeName : undefined,
      });
      await login(email, password);
      const dest = user.role === 'vendor' ? `/${locale}/vendor` : `/${locale}/account`;
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
          <UserIcon className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{dict.auth.registerTitle}</h1>
          <p className="mt-1 text-sm text-neutral-500">{dict.auth.registerSubtitle}</p>
        </div>
      </div>

      <Card className="w-full rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <Alert tone="error">{error}</Alert> : null}

          <Field label={dict.auth.role}>
            <Select value={role} onChange={(e) => setRole(e.target.value as 'customer' | 'vendor')}>
              <option value="customer">{dict.auth.customerRole}</option>
              <option value="vendor">{dict.auth.vendorRole}</option>
            </Select>
          </Field>

          <Field label={dict.auth.name}>
            <Input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </Field>

          <Field label={dict.auth.email}>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>

          <Field label={dict.auth.phone} hint={dict.productForm.optional}>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          </Field>

          <Field label={dict.auth.password}>
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Field>

          {role === 'vendor' ? (
            <Field label={dict.auth.storeName}>
              <Input required value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            </Field>
          ) : null}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {dict.auth.register}
          </Button>
        </form>
        <p className="mt-4 text-sm text-neutral-500">
          {dict.auth.haveAccount}{' '}
          <Link href={`/${locale}/login`} className="font-medium text-blue-700 hover:underline">
            {dict.auth.signIn}
          </Link>
        </p>
      </Card>
    </div>
  );
}