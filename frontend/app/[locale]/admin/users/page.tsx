'use client';

import { useCallback, useEffect, useState } from 'react';

import type { AppUser, UserStatus } from '@/types';
import { formatDate } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as adminService from '@/services/admin';
import { Alert, Badge, Button, EmptyState, PageHeader, Select, Spinner, TableShell, Th, Td } from '@/components/ui';

export default function AdminUsersPage() {
  const { locale, dict } = useLocale();
  const [users, setUsers] = useState<AppUser[] | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.listUsers({
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, dict.errors.generic]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: UserStatus) => {
    setError(null);
    try {
      await adminService.setUserStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    }
  };

  if (loading || !users) {
    return (
      <div>
        <PageHeader
          title={dict.admin.users}
          action={
            <div className="flex gap-2">
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-32">
                <option value="">{dict.common.all}</option>
                <option value="customer">{dict.auth.customerRole}</option>
                <option value="vendor">{dict.auth.vendorRole}</option>
                <option value="admin">admin</option>
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-32">
                <option value="">{dict.common.all}</option>
                <option value="active">active</option>
                <option value="suspended">suspended</option>
              </Select>
            </div>
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
        title={dict.admin.users}
        action={
          <div className="flex gap-2">
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-32">
              <option value="">{dict.common.all}</option>
              <option value="customer">{dict.auth.customerRole}</option>
              <option value="vendor">{dict.auth.vendorRole}</option>
              <option value="admin">admin</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-32">
              <option value="">{dict.common.all}</option>
              <option value="active">active</option>
              <option value="suspended">suspended</option>
            </Select>
          </div>
        }
      />
      {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}
      {users.length === 0 ? (
        <EmptyState title={dict.common.noData} />
      ) : (
        <TableShell>
          <thead className="bg-neutral-50">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>{dict.common.status}</Th>
              <Th>{dict.common.date}</Th>
              <Th>{dict.common.actions}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50">
                <Td label="Name" className="font-medium">{u.name}</Td>
                <Td label="Email">{u.email}</Td>
                <Td label="Role"><Badge tone={u.role === 'admin' ? 'blue' : u.role === 'vendor' ? 'amber' : 'neutral'}>{u.role}</Badge></Td>
                <Td label={dict.common.status}><Badge tone={u.status === 'active' ? 'green' : 'red'}>{u.status}</Badge></Td>
                <Td label={dict.common.date} className="text-xs text-neutral-500">{formatDate(u.createdAt, locale)}</Td>
                <Td label={dict.common.actions}>
                  {u.status === 'active' ? (
                    <Button size="sm" variant="danger" onClick={() => void setStatus(u.id, 'suspended')}>
                      {dict.admin.suspend}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => void setStatus(u.id, 'active')}>
                      {dict.admin.activate}
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}