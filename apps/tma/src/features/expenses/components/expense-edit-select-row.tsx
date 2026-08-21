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
    // Keep ghost for tappable card affordance; differs from NativePicker underline (h-10 border-b-input)
    // but intentionally uses rounded-xl card style for category row. If design converges to underline,
    // swap to border-b border-b-input px-0 h-10 to match NativePicker chrome.
    className='flex h-auto min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left'
    type='button'
    variant='ghost'
    onClick={onClick}>
    <div className='flex min-w-0 flex-1 items-center gap-3'>
      {children}
      <div className='min-w-0 flex-1 text-left'>
        <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
          {label}
        </p>
        <h3 className='m-0 mt-0.5 line-clamp-1 truncate text-[15px] font-semibold wrap-break-word text-foreground'>
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
