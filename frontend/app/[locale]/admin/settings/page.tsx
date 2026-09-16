'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { useLocale } from '@/lib/use-locale';
import * as adminService from '@/services/admin';
import { Alert, Button, Card, Field, Input, PageHeader, Spinner } from '@/components/ui';

export default function AdminSettingsPage() {
  const { dict } = useLocale();
  const [commissionRate, setCommissionRate] = useState('10');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await adminService.getSettings();
      setCommissionRate(String(settings.commissionRate));
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [dict.errors.generic]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const rate = Number(commissionRate);
      if (!Number.isFinite(rate) || rate < 0 || rate > 100) throw new Error('0–100');
      await adminService.updateSettings({ commissionRate: rate });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={dict.admin.settings} />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <PageHeader title={dict.admin.settings} />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          {error ? <Alert tone="error">{error}</Alert> : null}
          {success ? <Alert tone="success">{dict.common.save} ✓</Alert> : null}
          <Field label={dict.admin.commissionRate} hint="0–100">
            <Input
              type="number"
              min={0}
              max={100}
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={saving}>
            {dict.admin.saveSettings}
          </Button>
        </form>
      </Card>
    </div>
  );
}