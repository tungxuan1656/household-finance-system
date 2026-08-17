import { Button as ButtonPrimitive } from '@base-ui/react/button'

import { selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

export type SegmentedOption<T extends string> = {
  label: string
  value: T
}

export const SegmentedControl = <T extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: T) => void
  options: Array<SegmentedOption<T>>
  value: T
}) => (
  <div className='grid grid-cols-[repeat(var(--segment-count),minmax(0,1fr))] gap-1.5 rounded-[18px] bg-muted/70 p-1.5 shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground),transparent_94%)] [--segment-count:4]'>
    {options.map((option) => (
      <ButtonPrimitive
        key={option.value}
        aria-pressed={value === option.value}
        className={cn(
          'min-h-9 rounded-[13px] px-2 text-xs font-bold text-muted-foreground transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/30 active:translate-y-px',
          value === option.value && 'bg-primary/12 text-primary',
        )}
        type='button'
        onClick={() => {
          selection()
          onChange(option.value)
        }}>
        {option.label}
      </ButtonPrimitive>
    ))}
  </div>
)
