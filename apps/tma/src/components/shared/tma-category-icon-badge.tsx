import { cn } from '@/lib/utils'

export const TmaCategoryIconBadge = ({
  accent,
  iconUrl,
  symbol,
  size = 'md',
}: {
  accent: { background: string; foreground: string }
  iconUrl?: string | null
  symbol: string
  size?: 'sm' | 'md'
}) => (
  <span
    aria-hidden='true'
    className={cn(
      'grid shrink-0 place-items-center overflow-hidden font-bold',
      size === 'sm' && 'size-10 rounded-[14px] text-[11px]',
      size === 'md' && 'size-12 rounded-[18px] text-xs',
    )}
    style={{ backgroundColor: accent.background, color: accent.foreground }}>
    {iconUrl ? (
      <img
        alt=''
        className='size-[58%] object-contain'
        loading='lazy'
        src={iconUrl}
      />
    ) : (
      symbol
    )}
  </span>
)
