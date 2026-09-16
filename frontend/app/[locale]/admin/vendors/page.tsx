'use client';

import { useCallback, useEffect, useState } from 'react';

import type { PublicVendor, VendorStatus } from '@/types';
import { formatDate } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as adminService from '@/services/admin';
import { Alert, Badge, Button, EmptyState, PageHeader, Select, Spinner, TableShell, Th, Td } from '@/components/ui';

export default function AdminVendorsPage() {
  const { locale, dict } = useLocale();
  const [vendors, setVendors] = useState<PublicVendor[] | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.listVendorsAdmin(statusFilter ? { status: statusFilter } : {});
      setVendors(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dict.errors.generic]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: VendorStatus) => {
    setError(null);
    try {
      await adminService.setVendorStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    }
  };

  if (loading || !vendors) {
    return (
      <div>
        <PageHeader
          title={dict.admin.vendors}
          action={
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="">{dict.common.all}</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="suspended">suspended</option>
            </Select>
          }
        />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={dict.admin.vendors}
        action={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">{dict.common.all}</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
            <option value="suspended">suspended</option>
          </Select>
        }
      />
      {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}
      {vendors.length === 0 ? (
        <EmptyState title={dict.common.noData} />
      ) : (
        <TableShell>
          <thead className="bg-neutral-50">
            <tr>
              <Th>Store</Th>
              <Th>Slug</Th>
              <Th>{dict.common.status}</Th>
              <Th>{dict.common.date}</Th>
              <Th>{dict.common.actions}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {vendors.map((v) => (
              <tr key={v._id} className="hover:bg-neutral-50">
                <Td label="Store" className="font-medium">{v.storeName}</Td>
                <Td label="Slug" className="text-neutral-500">/{v.slug}</Td>
                <Td label={dict.common.status}>
                  <Badge tone={v.status === 'approved' ? 'green' : v.status === 'rejected' || v.status === 'suspended' ? 'red' : 'amber'}>
                    {v.status}
                  </Badge>
                </Td>
                <Td label={dict.common.date} className="text-xs text-neutral-500">{formatDate(v.createdAt, locale)}</Td>
                <Td label={dict.common.actions}>
                  <div className="flex flex-wrap gap-2">
                    {v.status !== 'approved' ? (
                      <Button size="sm" onClick={() => void setStatus(v._id, 'approved')}>
                        {dict.admin.approve}
                      </Button>
                    ) : null}
                    {v.status !== 'suspended' ? (
                      <Button size="sm" variant="danger" onClick={() => void setStatus(v._id, 'suspended')}>
                        {dict.admin.suspend}
                      </Button>
                    ) : null}
                    {v.status !== 'rejected' ? (
                      <Button size="sm" variant="outline" onClick={() => void setStatus(v._id, 'rejected')}>
                        {dict.admin.reject}
                      </Button>
                    ) : null}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}