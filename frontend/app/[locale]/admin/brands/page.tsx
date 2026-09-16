'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';

import type { Brand } from '@/types';
import { localizedText } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as adminService from '@/services/admin';
import { Alert, Badge, Button, Card, EmptyState, Field, Input, PageHeader, Spinner, TableShell, Th, Td } from '@/components/ui';

export default function AdminBrandsPage() {
  const { locale, dict } = useLocale();
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [editing, setEditing] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.listBrandsAdmin({ limit: 100 });
      setBrands(result.items);
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
    try {
      if (editing) {
        await adminService.updateBrand(editing._id, {
          name: { en: nameEn, ar: nameAr || undefined },
          logo: logo || undefined,
        });
      } else {
        await adminService.createBrand({
          name: { en: nameEn, ar: nameAr || undefined },
          slug: slug || undefined,
          logo: logo || undefined,
          status: 'active',
        });
      }
      setNameEn('');
      setNameAr('');
      setSlug('');
      setLogo('');
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (b: Brand) => {
    setEditing(b);
    setNameEn(b.name.en);
    setNameAr(b.name.ar ?? '');
    setSlug(b.slug ?? '');
    setLogo(b.logo ?? '');
  };

  const remove = async (id: string) => {
    if (!confirm(dict.common.confirm)) return;
    setError(null);
    try {
      await adminService.deleteBrand(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    }
  };

  const toggleStatus = async (b: Brand) => {
    setError(null);
    try {
      await adminService.setBrandStatus(b._id, b.status === 'active' ? 'inactive' : 'active');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    }
  };

  if (loading || !brands) {
    return (
      <div>
        <PageHeader title={dict.admin.brands} />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card title={editing ? dict.common.edit : dict.vendor.addProduct}>
          <form onSubmit={submit} className="space-y-4">
            {error ? <Alert tone="error">{error}</Alert> : null}
            <Field label="Name (EN)">
              <Input required value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            </Field>
            <Field label="Name (AR)" hint={dict.productForm.optional}>
              <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
            </Field>
            <Field label="Slug" hint={dict.productForm.optional}>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </Field>
            <Field label="Logo URL" hint={dict.productForm.optional}>
              <Input value={logo} onChange={(e) => setLogo(e.target.value)} />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>
                {editing ? dict.productForm.update : dict.productForm.create}
              </Button>
              {editing ? (
                <Button type="button" variant="ghost" onClick={() => { setEditing(null); setNameEn(''); setNameAr(''); setSlug(''); setLogo(''); }}>
                  {dict.common.cancel}
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {brands.length === 0 ? (
          <EmptyState title={dict.common.noData} />
        ) : (
          <TableShell>
            <thead className="bg-neutral-50">
              <tr>
                <Th>Name</Th>
                <Th>Slug</Th>
                <Th>{dict.common.status}</Th>
                <Th>{dict.common.actions}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {brands.map((b) => (
                <tr key={b._id} className="hover:bg-neutral-50">
                  <Td label="Name" className="font-medium">{localizedText(b.name, locale)}</Td>
                  <Td label="Slug" className="text-neutral-500">{b.slug}</Td>
                  <Td label={dict.common.status}><Badge tone={b.status === 'active' ? 'green' : 'amber'}>{b.status}</Badge></Td>
                  <Td label={dict.common.actions}>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(b)} className="text-sm font-medium text-blue-700 hover:underline">
                        {dict.common.edit}
                      </button>
                      <button onClick={() => void toggleStatus(b)} className="text-sm font-medium hover:underline">
                        {b.status === 'active' ? 'inactive' : 'active'}
                      </button>
                      <button onClick={() => void remove(b._id)} className="text-sm font-medium text-red-600 hover:underline">
                        {dict.common.delete}
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </div>
    </div>
  );
}