import type { Metadata } from 'next';
import { locale } from 'next/root-params';

import type { Locale } from '@/lib/i18n';
import { getDictionary, isLocale } from '@/lib/i18n';
import { LocaleProvider } from '@/lib/use-locale';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import '../globals.css';

export const generateStaticParams = () => [
  { locale: 'en' },
  { locale: 'ar' },
];

export async function generateMetadata(props: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale: l } = await props.params;
  const dict = getDictionary(isLocale(l) ? l : 'en');
  return {
    title: 'Marketplace',
    description:
      l === 'ar'
        ? 'سوق للمنتجات من المتاجر المحلية الموثوقة'
        : 'Online marketplace for verified local vendors',
  };
}

export default async function RootLayout(props: LayoutProps<'/[locale]'>) {
  const l = await locale();
  const resolved: Locale = isLocale(l) ? l : 'en';
  const dict = getDictionary(resolved);

  return (
    <html lang={resolved} dir={dict.dir}>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <LocaleProvider locale={resolved}>
          <AuthProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{props.children}</main>
                <Footer />
              </div>
            </CartProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}