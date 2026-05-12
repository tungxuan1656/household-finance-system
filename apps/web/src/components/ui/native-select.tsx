import { cva } from 'class-variance-authority'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

import {
  controlVariants,
  type PrimitiveControlSize,
  type PrimitiveControlVariant,
} from '@/components/ui/primitive-styles'
import { cn } from '@/lib/utils'

const nativeSelectSizeVariants = cva(
  'appearance-none py-1 pr-8 text-sm select-none selection:bg-primary selection:text-primary-foreground',
  {
    variants: {
      size: {
        sm: 'pl-2.5',
        default: 'pl-3',
        lg: 'pl-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

type NativeSelectProps = Omit<React.ComponentProps<'select'>, 'size'> & {
  size?: PrimitiveControlSize
  variant?: PrimitiveControlVariant
}

function NativeSelect({
  className,
  size = 'default',
  variant = 'default',
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        'group/native-select relative w-full has-[select:disabled]:opacity-50',
        className,
      )}
      data-size={size}
      data-slot='native-select-wrapper'>
      <select
        className={cn(
          controlVariants({ size, variant }),
          nativeSelectSizeVariants({ size }),
          'disabled:pointer-events-none',
        )}
        data-size={size}
        data-slot='native-select'
        data-variant={variant}
        {...props}
      />
      <ChevronDownIcon
        aria-hidden='true'
        className='pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground select-none'
        data-slot='native-select-icon'
      />
    </div>
  )
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<'option'>) {
  return (
    <option
      className={cn('bg-[Canvas] text-[CanvasText]', className)}
      data-slot='native-select-option'
      {...props}
    />
  )
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup
      className={cn('bg-[Canvas] text-[CanvasText]', className)}
      data-slot='native-select-optgroup'
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
