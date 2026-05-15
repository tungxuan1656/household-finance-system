import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/utils/cn'

type NativeSelectProps = Omit<React.ComponentProps<'select'>, 'size'> & {
  size?: 'sm' | 'default'
  labelClassName?: string
}

function NativeSelect({
  className,
  size = 'default',
  labelClassName,
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        'group/native-select relative w-fit has-[select:disabled]:opacity-50',
        className,
      )}
      data-size={size}
      data-slot='native-select-wrapper'>
      <select
        className={cn(
          'h-11 w-full min-w-0 appearance-none rounded-3xl border border-transparent bg-input/50 py-1 pr-10 pl-4 text-base transition-[color,box-shadow,background-color] outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=sm]:h-9 sm:h-9 sm:pr-8 sm:pl-3 sm:text-sm data-[size=sm]:sm:h-8 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
          labelClassName,
        )}
        data-size={size}
        data-slot='native-select'
        {...props}
      />
      <ChevronDownIcon
        aria-hidden='true'
        className='pointer-events-none absolute top-1/2 right-2.5 size-5 -translate-y-1/2 text-muted-foreground select-none sm:size-4'
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
