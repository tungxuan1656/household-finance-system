import { cva } from 'class-variance-authority'
import * as React from 'react'

import {
  controlVariants,
  type PrimitiveControlSize,
  type PrimitiveControlVariant,
} from '@/components/ui/primitive-styles'
import { cn } from '@/lib/utils'

const textareaSizeVariants = cva(
  'flex field-sizing-content w-full resize-none text-base md:text-sm',
  {
    variants: {
      size: {
        sm: 'min-h-14 py-2.5',
        default: 'min-h-16 py-3',
        lg: 'min-h-20 py-3.5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

function Textarea({
  className,
  size = 'default',
  variant = 'default',
  ...props
}: React.ComponentProps<'textarea'> & {
  size?: PrimitiveControlSize
  variant?: PrimitiveControlVariant
}) {
  return (
    <textarea
      className={cn(
        controlVariants({ size, variant }),
        textareaSizeVariants({ size }),
        'disabled:opacity-50',
        className,
      )}
      data-size={size}
      data-slot='textarea'
      data-variant={variant}
      {...props}
    />
  )
}

export { Textarea }
