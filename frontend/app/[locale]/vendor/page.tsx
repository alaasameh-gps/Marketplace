'use client';

import { useCallback, useEffect, useState } from 'react';

import type { CommissionSummary, PublicVendor } from '@/types';
import { useLocale } from '@/lib/use-locale';
import * as vendorService from '@/services/vendor';
import { Price } from '@/components/shared/price';
import { Alert, Card, PageHeader, Spinner } from '@/components/ui';

export default function VendorOverviewPage() {
  const { locale, dict } = useLocale();
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [vendor, setVendor] = useState<PublicVendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, v] = await Promise.all([
        vendorService.getMyCommissionSummary().catch(() => null),
        vendorService.getMyVendor().catch(() => null),
      ]);
      setSummary(s);
      setVendor(v);
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
      <PageHeader title={dict.vendor.salesOverview} />
      {error ? <Alert tone="error">{error}</Alert> : null}
      {vendor && vendor.status !== 'approved' ? (
        <Alert tone="info">
          {dict.auth.storeName} “{vendor.storeName}” — status: {vendor.status}
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card title={dict.vendor.totalSales}>
          <Price halalas={0} className="text-2xl font-bold" />
          <p className="mt-1 text-xs text-neutral-500">sales not tracked here</p>
        </Card>
        <Card title={dict.vendor.totalCommissions}>
          <Price halalas={summary?.totalCommissionAmount ?? 0} className="text-2xl font-bold" />
        </Card>
        <Card title={dict.vendor.totalEarnings}>
          <Price halalas={summary?.totalVendorEarnings ?? 0} className="text-2xl font-bold" />
        </Card>
      </div>

      {summary?.statusBreakdown && summary.statusBreakdown.length > 0 ? (
        <Card title="Commission status">
          <ul className="divide-y divide-neutral-100">
            {summary.statusBreakdown.map((row) => (
              <li key={row.status} className="flex justify-between py-2 text-sm">
                <span className="capitalize">{row.status}</span>
                <span>{row.count} record(s)</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}