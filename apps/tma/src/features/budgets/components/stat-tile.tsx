import { cn } from '@/lib/utils'

export const StatTile = ({
  label,
  tone = 'default',
  value,
}: {
  label: string
  tone?: 'default' | 'warning'
  value: string
}) => (
  <div className='grid gap-1 rounded-[18px] bg-black/4 p-3'>
    <span className='text-xs font-medium text-muted-foreground'>{label}</span>
    <strong
      className={cn(
        'text-base font-extrabold',
        tone === 'warning' ? 'text-[#d93838]' : 'text-foreground',
      )}>
      {value}
    </strong>
  </div>
)
