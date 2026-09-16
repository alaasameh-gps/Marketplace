'use client';

import { useCallback, useEffect, useState } from 'react';

import type { CommissionSummary } from '@/types';
import { useLocale } from '@/lib/use-locale';
import * as adminService from '@/services/admin';
import { Price } from '@/components/shared/price';
import { Alert, PageHeader, Spinner, StatCard } from '@/components/ui';
import { WalletIcon, BanknoteIcon, TrendingUpIcon, SettingsIcon } from '@/components/ui/icons';

export default function AdminOverviewPage() {
  const { dict } = useLocale();
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [settings, setSettings] = useState<{ commissionRate: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, set] = await Promise.all([
        adminService.getCommissionSummary(),
        adminService.getSettings(),
      ]);
      setSummary(s);
      setSettings(set);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [dict.errors.generic]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={dict.admin.platformOverview} />
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<TrendingUpIcon className="h-5 w-5" />}
          label="Commission records"
          value={summary?.totalRecords ?? 0}
        />
        <StatCard
          icon={<WalletIcon className="h-5 w-5" />}
          label="Total commissions"
          value={<Price halalas={summary?.totalCommissionAmount ?? 0} />}
          tone="amber"
        />
        <StatCard
          icon={<BanknoteIcon className="h-5 w-5" />}
          label="Total vendor earnings"
          value={<Price halalas={summary?.totalVendorEarnings ?? 0} />}
          tone="green"
        />
      </div>

      {summary?.statusBreakdown && summary.statusBreakdown.length > 0 ? (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-neutral-900">By status</h3>
          <ul className="divide-y divide-neutral-100">
            {summary.statusBreakdown.map((row) => (
              <li key={row.status} className="flex justify-between py-2 text-sm">
                <span className="capitalize text-neutral-600">{row.status}</span>
                <span className="font-medium text-neutral-900">{row.count} record(s)</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {settings ? (
        <div className="flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{dict.admin.settings}</p>
            <p className="mt-0.5 text-2xl font-bold text-neutral-900">
              {settings.commissionRate}%
              <span className="ms-2 text-sm font-normal text-neutral-500">{dict.admin.commissionRate}</span>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}