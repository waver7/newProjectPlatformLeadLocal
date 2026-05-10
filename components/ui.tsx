import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-brand-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-brand-500'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({ href, children, className, variant = 'primary', size = 'md' }: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1';
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-brand-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-card', className)}>
      {children}
    </div>
  );
}

export function Badge({ children, className, variant = 'default' }: {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-brand-100 text-brand-700'
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' }> = {
    OPEN:               { label: 'Open',        variant: 'info' },
    PENDING_MODERATION: { label: 'In Review',   variant: 'warning' },
    DRAFT:              { label: 'Draft',        variant: 'default' },
    AWARDED:            { label: 'Awarded',      variant: 'success' },
    CLOSED:             { label: 'Closed',       variant: 'default' },
    REJECTED:           { label: 'Rejected',     variant: 'danger' },
    SUBMITTED:          { label: 'Submitted',    variant: 'info' },
    ACCEPTED:           { label: 'Accepted',     variant: 'success' },
    WITHDRAWN:          { label: 'Withdrawn',    variant: 'default' },
    FLAGGED:            { label: 'Flagged',      variant: 'warning' },
    ACTIVE:             { label: 'Active',       variant: 'success' },
    CANCELED:           { label: 'Canceled',     variant: 'default' },
    PAST_DUE:           { label: 'Past Due',     variant: 'danger' },
    APPROVED:           { label: 'Approved',     variant: 'success' },
    PENDING:            { label: 'Pending',      variant: 'warning' },
  };
  const cfg = map[status] ?? { label: status, variant: 'default' as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const map: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' }> = {
    LOW:       { variant: 'default' },
    MEDIUM:    { variant: 'info' },
    HIGH:      { variant: 'warning' },
    EMERGENCY: { variant: 'danger' },
  };
  const cfg = map[urgency] ?? { variant: 'default' as const };
  return <Badge variant={cfg.variant}>{urgency}</Badge>;
}

export function Alert({ children, variant = 'error', className }: {
  children: ReactNode;
  variant?: 'error' | 'success' | 'warning' | 'info';
  className?: string;
}) {
  const variants = {
    error:   'bg-red-50 border-red-200 text-red-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info:    'bg-blue-50 border-blue-200 text-blue-800'
  };
  return (
    <div className={cn('rounded-lg border px-4 py-3 text-sm', variants[variant], className)}>
      {children}
    </div>
  );
}

export function FormField({ label, children, hint, required }: {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20', className)}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn('w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20', className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn('w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20', className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </Card>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
