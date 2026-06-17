import React from 'react'

import { cn } from '@/lib/utils'

export const ChipButton = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      aria-pressed={false}
      className={cn(
        'grid min-h-12 content-start gap-3 rounded-2xl bg-white p-2.5 text-left text-sm text-neutral-800 transition active:scale-[0.98]',
        className,
      )}
      type='button'
      {...props}
    />
  )
}
