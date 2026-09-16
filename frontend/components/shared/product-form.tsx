'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import type { Brand, Category, Product, ProductStatus } from '@/types';
import { useLocale } from '@/lib/use-locale';
import * as catalogService from '@/services/catalog';
import * as vendorService from '@/services/vendor';
import { Alert, Button, Card, Field, Input, Select, Textarea } from '@/components/ui';

interface Props {
  existing?: Product | null;
  productId?: string;
  localePrefix: string;
}

export function ProductForm({ existing, productId, localePrefix }: Props) {
  const { locale, dict } = useLocale();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [form, setForm] = useState(() => ({
    nameEn: existing?.name?.en ?? '',
    nameAr: existing?.name?.ar ?? '',
    descriptionEn: existing?.description?.en ?? '',
    descriptionAr: existing?.description?.ar ?? '',
    category: existing?.category?._id ?? '',
    brand: existing?.brand?._id ?? '',
    price: existing ? String(existing.price / 100) : '',
    compareAtPrice: existing?.compareAtPrice ? String(existing.compareAtPrice / 100) : '',
    sku: existing?.sku ?? '',
    stock: existing?.inventory?.availableStock != null ? String(existing.inventory.availableStock) : '',
    status: (existing?.status ?? 'draft') as ProductStatus,
    images: existing?.images?.join(', ') ?? '',
  }));

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void catalogService.listCategories().then(setCategories).catch(() => setCategories([]));
    void catalogService.listBrands({ limit: 100 }).then((r) => setBrands(r.items)).catch(() => setBrands([]));
  }, []);

  const halalas = (sar: string) => {
    const n = Number(sar);
    if (!Number.isFinite(n) || n < 0) return NaN;
    return Math.round(n * 100);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const price = halalas(form.price);
    if (Number.isNaN(price)) {
      setError(dict.productForm.price);
      return;
    }
    const compareAt = form.compareAtPrice ? halalas(form.compareAtPrice) : undefined;
    if (compareAt !== undefined && Number.isNaN(compareAt)) {
      setError(dict.productForm.compareAtPrice);
      return;
    }

    setLoading(true);
    setError(null);
    const payload: vendorService.VendorProductInput = {
      category: form.category,
      brand: form.brand || null,
      name: { en: form.nameEn, ar: form.nameAr || undefined },
      description:
        form.descriptionEn || form.descriptionAr
          ? { en: form.descriptionEn, ar: form.descriptionAr || undefined }
          : undefined,
      images: form.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      sku: form.sku || undefined,
      price,
      compareAtPrice: compareAt,
      status: form.status,
      availableStock: form.stock ? Number(form.stock) : undefined,
    };

    try {
      if (existing && productId) {
        await vendorService.updateMyProduct(productId, payload);
        router.push(`/${localePrefix}/vendor/products`);
      } else {
        await vendorService.createMyProduct(payload);
        router.push(`/${localePrefix}/vendor/products?created=1`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}
      <Card title={existing ? dict.vendor.editProduct : dict.vendor.addProduct}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={dict.productForm.nameEn}>
              <Input required value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
            </Field>
            <Field label={dict.productForm.nameAr} hint={dict.productForm.optional}>
              <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
            </Field>
            <Field label={dict.productForm.category}>
              <Select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name.en}</option>
                ))}
              </Select>
            </Field>
            <Field label={dict.productForm.brand} hint={dict.productForm.optional}>
              <Select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
                <option value="">—</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>{b.name.en}</option>
                ))}
              </Select>
            </Field>
            <Field label={dict.productForm.price}>
              <Input required inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label={dict.productForm.compareAtPrice} hint={dict.productForm.optional}>
              <Input inputMode="decimal" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
            </Field>
            <Field label={dict.productForm.sku} hint={dict.productForm.optional}>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </Field>
            <Field label={dict.productForm.stock}>
              <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </Field>
            <Field label={dict.productForm.status}>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}>
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label={dict.productForm.descriptionEn}>
                <Textarea rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={dict.productForm.descriptionAr} hint={dict.productForm.optional}>
                <Textarea rows={3} value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={dict.productForm.images} hint={dict.productForm.optional}>
                <Textarea rows={2} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
              </Field>
            </div>
          </div>
          <Button type="submit" loading={loading}>
            {existing ? dict.productForm.update : dict.productForm.create}
          </Button>
        </form>
      </Card>
    </div>
  );
}