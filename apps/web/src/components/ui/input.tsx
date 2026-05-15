import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/utils/cn'

const inputVariants = cva(
  'w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-4 py-1 text-base transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      size: {
        default: 'h-11 sm:h-9 sm:px-3 sm:text-sm',
        sm: 'h-10 px-3 text-sm sm:h-9 sm:px-3 sm:text-sm',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

function Input({
  className,
  type,
  size,
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      className={cn(inputVariants({ size, className }))}
      data-slot='input'
      type={type}
      {...props}
    />
  )
}

export { Input }
