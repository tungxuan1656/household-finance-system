import type { ReactNode } from 'react'

import { ChevronRightIcon } from '@/components/shared/tma-icons'
import { Button } from '@/components/ui/button'

export const EditSelectRow = ({
  children,
  label,
  onClick,
  value,
}: {
  children?: ReactNode
  label: string
  onClick: () => void
  value: string
}) => (
  <Button
    className='flex w-full items-center justify-between gap-3'
    type='button'
    variant='ghost'
    onClick={onClick}>
    <div className='flex min-w-0 items-center gap-3'>
      {children}
      <div className='min-w-0 text-left'>
        <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
          {label}
        </p>
        <h3 className='m-0 mt-0.5 truncate text-[15px] font-semibold text-foreground'>
          {value}
        </h3>
      </div>
    </div>
    <ChevronRightIcon
      className='shrink-0 text-muted-foreground'
      height='18'
      width='18'
    />
  </Button>
)
