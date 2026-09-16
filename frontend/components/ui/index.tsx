import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors',
  dark: 'bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 active:bg-neutral-950 transition-colors',
  secondary: 'bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 transition-colors',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 transition-colors',
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors',
  outline:
    'border border-neutral-300 bg-white text-neutral-800 shadow-sm hover:border-neutral-400 hover:bg-neutral-50 transition-colors',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

const inputBase =
  'w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-sm transition-shadow focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:opacity-60';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputBase} ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputBase} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputBase} ${className}`} {...props} />;
}

export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <label className={`mb-1.5 block text-sm font-medium text-neutral-700 ${className}`}>
      {children}
    </label>
  );
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label?: ReactNode;
  error?: string | null;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label ? <Label>{label}</Label> : null}
      {children}
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

type BadgeTone = 'neutral' | 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'indigo';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 text-neutral-700',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  red: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20',
  gray: 'bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-300',
};

const badgeDot: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-400',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  gray: 'bg-neutral-400',
};

export function Badge({
  tone = 'neutral',
  dot = false,
  children,
  className = '',
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeTones[tone]} ${className}`}
    >
      {dot ? <span className={`h-1.5 w-1.5 rounded-full ${badgeDot[tone]}`} /> : null}
      {children}
    </span>
  );
}

export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const px = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-9 w-9 border-[3px]' : 'h-6 w-6 border-2';
  return (
    <span
      className={`inline-block animate-spin rounded-full border-neutral-300 border-t-blue-600 ${px} ${className}`}
      role="status"
      aria-label="loading"
    />
  );
}

export function Alert({
  tone = 'error',
  title,
  children,
  className = '',
}: {
  tone?: 'error' | 'success' | 'info';
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${styles[tone]} ${className}`}>
      <span className="mt-0.5 text-base leading-none" aria-hidden>
        {tone === 'error' ? '⚠️' : tone === 'success' ? '✅' : 'ℹ️'}
      </span>
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}

export function Card({
  children,
  className = '',
  title,
  action,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-neutral-200/80 bg-white shadow-sm ${padded ? 'p-5' : ''} ${className}`}
    >
      {title || action ? (
        <div className={`flex items-center justify-between gap-3 ${padded ? 'mb-4' : 'mb-0 border-b border-neutral-100 px-5 py-4'}`}>
          {title ? <h3 className="text-base font-semibold text-neutral-900">{title}</h3> : null}
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'blue',
}: {
  icon?: ReactNode;
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'blue' | 'green' | 'amber' | 'neutral' | 'indigo';
}) {
  const tones: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    neutral: 'bg-neutral-100 text-neutral-600',
  };
  return (
    <div className="flex items-start gap-4 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {icon ? (
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
        {hint ? <p className="mt-0.5 truncate text-xs text-neutral-500">{hint}</p> : null}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 px-6 py-14 text-center">
      {icon ? <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">{icon}</div> : null}
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-neutral-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-neutral-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <th className={`px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wide text-neutral-500 ${className}`}>
      {children}
    </th>
  );
}

export function Td({
  children,
  className = '',
  label,
}: { children?: ReactNode; className?: string; label?: string }) {
  return (
    <td data-label={label} className={`px-5 py-3.5 text-sm text-neutral-800 ${className}`}>
      {children}
    </td>
  );
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-sm">
      <table className="card-table min-w-full divide-y divide-neutral-200 [&>tbody>tr]:transition-colors [&>tbody>tr:hover]:bg-neutral-50">
        {children}
      </table>
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onPage,
  buildHref,
}: {
  page: number;
  totalPages: number;
  onPage?: (next: number) => void;
  buildHref?: (next: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages: Array<number | '…'> = [];
  const total = Math.max(totalPages, 1);
  const current = Math.min(Math.max(page, 1), total);
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  const baseCls =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors';
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-1.5" aria-label="pagination">
      {current > 1 ? (
        buildHref ? (
          <Link href={buildHref(current - 1)} className={`${baseCls} border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50`}>
            Prev
          </Link>
        ) : (
          <button type="button" onClick={() => onPage?.(current - 1)} className={`${baseCls} border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50`}>
            Prev
          </button>
        )
      ) : null}
      {pages.map((p, idx) =>
        p === '…' ? (
          <span key={`e${idx}`} className="px-2 text-sm text-neutral-400">
            …
          </span>
        ) : buildHref ? (
          <Link
            key={p}
            href={buildHref(p)}
            className={`${baseCls} ${p === current ? 'bg-blue-600 text-white shadow-sm' : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`}
          >
            {p}
          </Link>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage?.(p)}
            className={`${baseCls} ${p === current ? 'bg-blue-600 text-white shadow-sm' : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`}
          >
            {p}
          </button>
        ),
      )}
      {current < total ? (
        buildHref ? (
          <Link href={buildHref(current + 1)} className={`${baseCls} border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50`}>
            Next
          </Link>
        ) : (
          <button type="button" onClick={() => onPage?.(current + 1)} className={`${baseCls} border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50`}>
            Next
          </button>
        )
      ) : null}
    </nav>
  );
}