import { Eyebrow } from '@/components/ui'
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
    <Eyebrow>{label}</Eyebrow>
    <strong
      className={cn(
        'text-base font-extrabold',
        tone === 'warning' ? 'text-[#d93838]' : 'text-tma-text-strong',
      )}>
      {value}
    </strong>
  </div>
)
