'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';

import type { Category } from '@/types';
import { localizedText } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as adminService from '@/services/admin';
import { Alert, Badge, Button, Card, EmptyState, Field, Input, PageHeader, Spinner, TableShell, Th, Td } from '@/components/ui';

export default function AdminCategoriesPage() {
  const { locale, dict } = useLocale();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [parent, setParent] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.listCategoriesAdmin({ limit: 100 });
      setCategories(result.items);
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
        await adminService.updateCategory(editing._id, {
          name: { en: nameEn, ar: nameAr || undefined },
          icon: icon || undefined,
          parent: parent || null,
        });
      } else {
        await adminService.createCategory({
          name: { en: nameEn, ar: nameAr || undefined },
          slug: slug || undefined,
          icon: icon || undefined,
          parent: parent || null,
          status: 'active',
          sortOrder: 0,
        });
      }
      setNameEn('');
      setNameAr('');
      setSlug('');
      setIcon('');
      setParent('');
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: Category) => {
    setEditing(c);
    setNameEn(c.name.en);
    setNameAr(c.name.ar ?? '');
    setSlug(c.slug ?? '');
    setIcon(c.icon ?? '');
    setParent(c.parent ?? '');
  };

  const remove = async (id: string) => {
    if (!confirm(dict.common.confirm)) return;
    setError(null);
    try {
      await adminService.deleteCategory(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    }
  };

  const toggleStatus = async (c: Category) => {
    setError(null);
    try {
      await adminService.setCategoryStatus(c._id, c.status === 'active' ? 'inactive' : 'active');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    }
  };

  if (loading || !categories) {
    return (
      <div>
        <PageHeader title={dict.admin.categories} />
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
            <Field label="Icon" hint={dict.productForm.optional}>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} />
            </Field>
            <Field label="Parent category" hint={dict.productForm.optional}>
              <select
                value={parent}
                onChange={(e) => setParent(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {localizedText(c.name, locale)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>
                {editing ? dict.productForm.update : dict.productForm.create}
              </Button>
              {editing ? (
                <Button type="button" variant="ghost" onClick={() => { setEditing(null); setNameEn(''); setNameAr(''); setSlug(''); setIcon(''); setParent(''); }}>
                  {dict.common.cancel}
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {categories.length === 0 ? (
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
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-neutral-50">
                  <Td label="Name" className="font-medium">
                    {localizedText(c.name, locale)}
                    <span className="ms-2 text-xs text-neutral-400">{c.parent ? 'child' : 'root'}</span>
                  </Td>
                  <Td label="Slug" className="text-neutral-500">{c.slug}</Td>
                  <Td label={dict.common.status}><Badge tone={c.status === 'active' ? 'green' : 'amber'}>{c.status}</Badge></Td>
                  <Td label={dict.common.actions}>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(c)} className="text-sm font-medium text-blue-700 hover:underline">
                        {dict.common.edit}
                      </button>
                      <button onClick={() => void toggleStatus(c)} className="text-sm font-medium hover:underline">
                        {c.status === 'active' ? 'inactive' : 'active'}
                      </button>
                      <button onClick={() => void remove(c._id)} className="text-sm font-medium text-red-600 hover:underline">
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