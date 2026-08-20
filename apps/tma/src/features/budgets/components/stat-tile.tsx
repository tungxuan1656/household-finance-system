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
  <div className='grid gap-1'>
    <span className='text-xs font-medium text-muted-foreground'>{label}</span>
    <strong
      className={cn(
        'text-base font-extrabold',
        tone === 'warning' ? 'text-destructive' : 'text-foreground',
      )}>
      {value}
    </strong>
  </div>
)
