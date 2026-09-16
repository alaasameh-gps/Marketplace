'use client';

import { useLocale } from '@/lib/use-locale';
import { ProductForm } from '@/components/shared/product-form';

export default function NewProductPage() {
  const { locale } = useLocale();
  return <ProductForm existing={null} localePrefix={locale} />;
}