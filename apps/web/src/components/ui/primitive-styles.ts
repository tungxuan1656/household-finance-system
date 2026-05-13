import { cva } from 'class-variance-authority'

export type PrimitiveControlSize = 'sm' | 'default' | 'lg' | 'xl' | '2xl'
export type PrimitiveControlVariant = 'default' | 'ghost' | 'subtle'
export type PrimitiveSurface = 'glass' | 'subtle' | 'outline' | 'solid'

export const overlayGlassClass =
  'bg-black/80 supports-backdrop-filter:backdrop-blur-xl'

export const surfaceVariants = cva('', {
  variants: {
    surface: {
      glass: 'border-white/10 bg-card/65 shadow-glass backdrop-blur-xl',
      subtle: 'border-border/60 bg-background/80 shadow-sm',
      outline: 'border-border bg-transparent shadow-none backdrop-blur-none',
      solid: 'border-border bg-card shadow-lg backdrop-blur-none',
    },
  },
  defaultVariants: {
    surface: 'glass',
  },
})

export const popupSurfaceVariants = cva('', {
  variants: {
    surface: {
      glass: 'border-white/10 bg-popover/65 shadow-glass backdrop-blur-xl',
      subtle: 'border-border/60 bg-background/95 shadow-md backdrop-blur-none',
      outline: 'border-border bg-background shadow-none backdrop-blur-none',
      solid: 'border-border bg-popover shadow-lg backdrop-blur-none',
    },
  },
  defaultVariants: {
    surface: 'glass',
  },
})

export const drawerFrameSurfaceVariants = cva('', {
  variants: {
    surface: {
      glass:
        'before:absolute before:inset-2 before:-z-10 before:rounded-xl before:border before:border-white/10 before:bg-popover/65 before:shadow-glass before:backdrop-blur-xl',
      subtle:
        'before:absolute before:inset-2 before:-z-10 before:rounded-xl before:border before:border-border/60 before:bg-background/95 before:shadow-md',
      outline:
        'before:absolute before:inset-2 before:-z-10 before:rounded-xl before:border before:border-border before:bg-background before:shadow-none',
      solid:
        'before:absolute before:inset-2 before:-z-10 before:rounded-xl before:border before:border-border before:bg-popover before:shadow-lg',
    },
  },
  defaultVariants: {
    surface: 'glass',
  },
})

export const controlVariants = cva(
  'w-full min-w-0 border border-input text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      variant: {
        default: 'bg-input/40',
        ghost: 'bg-transparent shadow-none',
        subtle: 'bg-background/70',
      },
      size: {
        sm: 'h-8 rounded-md px-2.5',
        default: 'h-9 rounded-lg px-3',
        lg: 'h-10 rounded-xl px-4',
        xl: 'h-11 rounded-xl px-4',
        '2xl': 'h-12 rounded-xl px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
