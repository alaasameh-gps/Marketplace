'use client';

import { useState, type FormEvent } from 'react';

import { useLocale } from '@/lib/use-locale';
import { useAuth } from '@/hooks/use-auth';
import * as userService from '@/services/user';
import * as authService from '@/services/auth';
import { Alert, Button, Card, Field, Input, PageHeader } from '@/components/ui';

export default function AccountPage() {
  const { dict } = useLocale();
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      await userService.updateProfile({
        name: profile.name,
        phone: profile.phone || undefined,
      });
      await refreshUser();
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    setPwError(null);
    setPwSuccess(false);
    try {
      await authService.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '' });
      setPwSuccess(true);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={dict.account.title} />

      <Card title={dict.account.profile}>
        <form onSubmit={saveProfile} className="space-y-4">
          {profileError ? <Alert tone="error">{profileError}</Alert> : null}
          {profileSuccess ? <Alert tone="success">{dict.common.save} ✓</Alert> : null}
          <Field label={dict.account.name}>
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </Field>
          <Field label={dict.account.email}>
            <Input value={user?.email ?? ''} disabled />
          </Field>
          <Field label={dict.account.phone}>
            <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </Field>
          <Button type="submit" loading={savingProfile}>
            {dict.account.saveProfile}
          </Button>
        </form>
      </Card>

      <Card title={dict.account.changePassword}>
        <form onSubmit={savePassword} className="space-y-4">
          {pwError ? <Alert tone="error">{pwError}</Alert> : null}
          {pwSuccess ? <Alert tone="success">{dict.common.save} ✓</Alert> : null}
          <Field label={dict.account.currentPassword}>
            <Input
              type="password"
              required
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
            />
          </Field>
          <Field label={dict.account.newPassword}>
            <Input
              type="password"
              required
              minLength={8}
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
            />
          </Field>
          <Button type="submit" loading={savingPw}>
            {dict.account.changePassword}
          </Button>
        </form>
      </Card>
    </div>
  );
}