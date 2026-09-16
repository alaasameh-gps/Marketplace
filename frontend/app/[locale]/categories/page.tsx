import Link from 'next/link';

import type { Locale } from '@/lib/i18n';
import { getDictionary, isLocale } from '@/lib/i18n';
import { localizedText } from '@/lib/format';
import { serverListCategories } from '@/services/catalog';
import { ArrowRightIcon } from '@/components/ui/icons';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage(props: PageProps<'/[locale]/categories'>) {
  const { locale: l } = await props.params;
  const resolved: Locale = isLocale(l) ? l : 'en';
  const dict = getDictionary(resolved);

  const categories = await serverListCategories().catch(() => []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{dict.home.browseCategories}</h1>
        <p className="text-sm text-neutral-500">{dict.products.subtitle}</p>
      </div>

      {categories.length === 0 ? (
        <p className="text-neutral-500">{dict.common.noData}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category._id}
              className="group rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <Link href={`/${resolved}/categories/${category.slug}`} className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl transition-colors group-hover:bg-blue-100">
                  {category.icon ?? '🗂️'}
                </span>
                <span className="text-lg font-semibold text-neutral-900 group-hover:text-blue-700">
                  {localizedText(category.name, resolved)}
                </span>
                <ArrowRightIcon className="ms-auto h-4 w-4 text-neutral-300 transition-colors group-hover:text-blue-600 rtl:-scale-x-100" />
              </Link>
              {category.children && category.children.length > 0 ? (
                <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
                  {category.children.map((child) => (
                    <li key={child._id}>
                      <Link
                        href={`/${resolved}/categories/${child.slug}`}
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-blue-700"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 transition-colors group-hover:bg-blue-500" />
                        {localizedText(child.name, resolved)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}