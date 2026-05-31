'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

type PageHeaderProps = {
  title: string
  description?: ReactNode
  showBack?: boolean
  onBack?: () => void
  backLabel?: string
  left?: ReactNode
  right?: ReactNode
  sticky?: boolean
  className?: string
}

export const PageHeader = ({
  title,
  description,
  showBack = false,
  onBack,
  backLabel = 'Go back',
  left,
  right,
  sticky = true,
  className,
}: PageHeaderProps) => {
  const router = useRouter()
  const handleBack = onBack ?? (() => router.back())

  return (
    <>
      <header
        className={cn(
          'z-40 flex min-h-16 items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-4 pt-safe backdrop-blur-md md:hidden',
          sticky ? 'sticky top-0' : 'relative',
          className,
        )}>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          {showBack ? (
            <Button
              aria-label={backLabel}
              size='icon'
              variant='ghost'
              onClick={handleBack}>
              <ArrowLeft className='size-5' />
            </Button>
          ) : null}
          {left}
          <div className='flex min-w-0 flex-1 flex-col'>
            <h1 className='truncate text-xl font-semibold'>{title}</h1>
            {description ? (
              <p className='text-sm leading-5 text-muted-foreground'>
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {right ? <div className='flex items-center gap-2'>{right}</div> : null}
      </header>

      <div className='hidden md:block'>
        <div className='flex items-start justify-between gap-4 px-6 pt-8 pb-6 lg:px-8'>
          <div className='flex min-w-0 flex-1 items-start gap-3'>
            {showBack ? (
              <Button
                aria-label={backLabel}
                size='icon'
                variant='ghost'
                onClick={handleBack}>
                <ArrowLeft className='size-5' />
              </Button>
            ) : null}
            {left}
            <div className='flex min-w-0 flex-1 flex-col gap-1'>
              <h1 className='font-heading text-2xl tracking-tight'>{title}</h1>
              {description ? (
                <p className='text-sm text-muted-foreground'>{description}</p>
              ) : null}
            </div>
          </div>
          {right ? (
            <div className='flex shrink-0 items-center gap-2'>{right}</div>
          ) : null}
        </div>
      </div>
    </>
  )
}
