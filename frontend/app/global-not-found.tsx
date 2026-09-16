import Link from 'next/link';

import './globals.css';

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
          <div className="rounded-2xl border border-neutral-200 p-10 shadow-sm">
            <p className="text-6xl">🕳️</p>
            <p className="mt-4 text-sm uppercase tracking-widest text-neutral-400">Error 404</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">Page not found</h1>
            <p className="mt-2 text-neutral-500">The page you are looking for does not exist.</p>
            <Link
              href="/en"
              className="mt-6 inline-block rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Back to home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}