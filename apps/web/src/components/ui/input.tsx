import * as React from 'react'

import {
  controlVariants,
  type PrimitiveControlSize,
  type PrimitiveControlVariant,
} from '@/components/ui/primitive-styles'
import { cn } from '@/lib/utils'

type InputProps = Omit<React.ComponentProps<'input'>, 'size'> & {
  size?: PrimitiveControlSize
  variant?: PrimitiveControlVariant
}

function Input({
  className,
  type,
  size = 'default',
  variant = 'default',
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        controlVariants({ size, variant }),
        'py-1 text-base file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:opacity-50 md:text-sm',
        className,
      )}
      data-size={size}
      data-slot='input'
      data-variant={variant}
      type={type}
      {...props}
    />
  )
}

export { Input }
