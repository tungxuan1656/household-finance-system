import type { ReactNode } from 'react'

import { ChevronRightIcon } from '@/components/shared/tma-icons'

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
  <div
    className='flex cursor-pointer items-center justify-between gap-3 border-b border-border py-4 last:border-b-0'
    role='button'
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(event) => {
      if (event.key === 'Enter') onClick()
    }}>
    <div className='flex min-w-0 items-center gap-3'>
      {children}
      <div className='min-w-0'>
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
  </div>
)
