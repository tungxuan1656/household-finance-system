import type { ReactElement, SVGProps } from 'react'
import { Link } from 'react-router-dom'

import { Chip, IconBadge } from '@/components/ui'
import { impact } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

export const ShortcutItem = ({
  accent,
  disabled,
  hint,
  href,
  icon: Icon,
  title,
}: {
  accent: { background: string; foreground: string }
  disabled?: boolean
  hint: string
  href: string
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement
  title: string
}) => {
  const content = (
    <>
      <div className='flex items-start justify-between gap-3'>
        <IconBadge accent={accent}>
          <Icon height={20} strokeWidth={2.1} width={20} />
        </IconBadge>
        {disabled ? <Chip tone='warning'>Sớm có</Chip> : null}
      </div>
      <div>
        <h3 className='m-0 text-[15px] leading-tight font-semibold text-tma-text-strong'>
          {title}
        </h3>
        <p className='m-0 mt-1 text-xs leading-normal text-tma-text-muted'>
          {hint}
        </p>
      </div>
    </>
  )

  const className =
    'grid min-h-28 content-start gap-3 rounded-[20px] border border-black/[0.04] bg-white p-3.5 shadow-tma-soft transition active:scale-[0.98]'

  if (disabled) {
    return (
      <div aria-disabled='true' className={cn(className, 'opacity-75')}>
        {content}
      </div>
    )
  }

  return (
    <Link
      className={className}
      to={href}
      onClick={() => {
        impact('light')
      }}>
      {content}
    </Link>
  )
}
