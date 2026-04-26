import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export function Button({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-60', className)} {...props}>{children}</button>;
}

export function LinkButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <Link href={href} className={cn('rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-700 inline-block', className)}>{children}</Link>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-xl border bg-white p-4 shadow-sm', className)}>{children}</div>;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('rounded-full bg-slate-100 px-2 py-1 text-xs font-medium', className)}>{children}</span>;
}
