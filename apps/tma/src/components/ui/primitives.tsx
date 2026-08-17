import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const Eyebrow = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <p
    className={cn(
      'm-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase',
      className,
    )}>
    {children}
  </p>
)

export const Section = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) => (
  <section className={cn('mt-6', className)} {...props}>
    {children}
  </section>
)

export const SectionHeader = ({
  action,
  eyebrow,
  title,
}: {
  action?: ReactNode
  eyebrow?: ReactNode
  title: ReactNode
}) => (
  <div className='mb-3 flex items-end justify-between gap-3'>
    <div className='min-w-0'>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className='m-0 text-base leading-tight font-semibold text-foreground'>
        {title}
      </h2>
    </div>
    {action ? <div className='shrink-0'>{action}</div> : null}
  </div>
)

export const Chip = ({
  children,
  className,
  tone = 'muted',
}: {
  children: ReactNode
  className?: string
  tone?: 'muted' | 'primary' | 'success' | 'warning'
}) => (
  <span
    className={cn(
      'inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold',
      tone === 'muted' && 'bg-muted text-foreground',
      tone === 'primary' && 'bg-primary/12 text-primary',
      tone === 'success' && 'bg-emerald-100 text-emerald-700',
      tone === 'warning' && 'bg-amber-100 text-amber-800',
      className,
    )}>
    {children}
  </span>
)

export const Avatar = ({
  alt,
  className,
  fallback,
  size = 'md',
  src,
}: {
  alt: string
  className?: string
  fallback: ReactNode
  size?: 'lg' | 'md' | 'sm' | 'xl'
  src?: string | null
}) => (
  <span
    className={cn(
      'grid shrink-0 place-items-center overflow-hidden bg-linear-to-br from-primary/20 to-emerald-300/30 font-bold text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.54)]',
      size === 'sm' && 'size-10 rounded-2xl text-xs',
      size === 'md' && 'size-11 rounded-[18px] text-sm',
      size === 'lg' && 'size-14 rounded-[20px] text-sm',
      size === 'xl' && 'size-24 rounded-[30px] text-2xl',
      className,
    )}>
    {src ? (
      <img alt={alt} className='size-full object-cover' src={src} />
    ) : (
      fallback
    )}
  </span>
)

export const MoneyLabel = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <span
    className={cn(
      'font-mono text-foreground [font-variant-numeric:tabular-nums]',
      className,
    )}>
    {children}
  </span>
)

export const IconBadge = ({
  accent,
  children,
  className,
  size = 'md',
}: {
  accent?: { background: string; foreground: string }
  children: ReactNode
  className?: string
  size?: 'md' | 'sm'
}) => (
  <span
    aria-hidden='true'
    className={cn(
      'grid shrink-0 place-items-center font-bold',
      size === 'sm' && 'size-9 rounded-xl text-[11px]',
      size === 'md' && 'size-10 rounded-[14px] text-xs',
      !accent && 'bg-primary/12 text-primary',
      className,
    )}
    style={
      accent
        ? { backgroundColor: accent.background, color: accent.foreground }
        : undefined
    }>
    {children}
  </span>
)
