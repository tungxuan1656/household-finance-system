import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-10 w-full min-w-0 rounded-xl border border-white/20 bg-background/50 px-3 py-2 text-base transition-all outline-none placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:border-white/10 dark:bg-white/5 dark:focus-visible:border-white/50 dark:focus-visible:ring-white/10',
        className,
      )}
      data-slot='input'
      type={type}
      {...props}
    />
  )
}

export { Input }
