import type { ReactNode } from 'react'

import { MobileHeader } from '@/components/layouts/mobile-header'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'

interface PageShellProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  actions?: ReactNode
  children: ReactNode
}

function PageShell({
  title,
  showBack,
  onBack,
  actions,
  children,
}: PageShellProps) {
  return (
    <div className='flex min-h-0 flex-col'>
      <MobileHeader
        actions={actions}
        showBack={showBack}
        title={title}
        onBack={onBack}
      />
      <div className='flex-1 px-4 py-5 pb-24 sm:py-8 md:px-6 md:pb-8 lg:px-8'>
        <h1 className='sr-only md:not-sr-only md:mb-6 md:font-heading md:text-2xl md:tracking-tight'>
          {title}
        </h1>
        {children}
      </div>
    </div>
  )
}

interface PageSectionProps {
  title?: string
  children: ReactNode
  variant?: 'default' | 'card' | 'stats' | 'list'
  className?: string
}

function PageSection({
  title,
  children,
  variant = 'default',
  className,
}: PageSectionProps) {
  if (variant === 'card') {
    return (
      <section className={cn('space-y-4', className)}>
        {title && <h2 className='text-lg font-semibold'>{title}</h2>}
        <Card>
          <CardContent className='p-4 md:p-6'>{children}</CardContent>
        </Card>
      </section>
    )
  }

  if (variant === 'stats') {
    return (
      <section className={cn('space-y-4', className)}>
        {title && (
          <h2 className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>
            {title}
          </h2>
        )}
        <div>{children}</div>
      </section>
    )
  }

  if (variant === 'list') {
    return (
      <section className={className}>
        <div className='divide-y divide-border'>{children}</div>
      </section>
    )
  }

  // default
  return (
    <section className={cn('space-y-4', className)}>
      {title && <h2 className='text-lg font-semibold'>{title}</h2>}
      <div>{children}</div>
    </section>
  )
}

export { PageSection, PageShell }
