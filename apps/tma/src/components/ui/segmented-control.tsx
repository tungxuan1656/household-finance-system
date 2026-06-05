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
  <div className='grid grid-cols-[repeat(var(--segment-count),minmax(0,1fr))] gap-1.5 rounded-[18px] bg-white/65 p-1.5 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)] [--segment-count:4]'>
    {options.map((option) => (
      <button
        key={option.value}
        className={cn(
          'min-h-9 rounded-[13px] px-2 text-xs font-bold text-tma-text-muted transition active:scale-95',
          value === option.value && 'bg-tma-primary/12 text-tma-primary',
        )}
        type='button'
        onClick={() => onChange(option.value)}>
        {option.label}
      </button>
    ))}
  </div>
)
