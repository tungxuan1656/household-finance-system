import type { ReactElement, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Chip, IconBadge } from '@/components/ui'
import { impact } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

export const ShortcutItem = ({
  accent,
  disabled,
  href,
  icon: Icon,
  onClick,
  title,
}: {
  accent: { background: string; foreground: string }
  disabled?: boolean
  href: string
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement
  onClick?: () => void
  title: string
}) => {
  const { t } = useTranslation()
  const content = (
    <>
      <div className='flex items-start justify-between gap-3'>
        <IconBadge accent={accent}>
          <Icon height={20} strokeWidth={2.1} width={20} />
        </IconBadge>
        {disabled ? (
          <Chip tone='warning'>{t('shortcuts.comingSoon')}</Chip>
        ) : null}
      </div>
      <div>
        <h3 className='m-0 text-[15px] leading-tight font-semibold text-tma-text-strong'>
          {title}
        </h3>
      </div>
    </>
  )

  const className =
    'flex items-center content-start gap-3 rounded-3xl border border-black/4 bg-white p-3.5 shadow-tma-soft transition active:scale-[0.98]'

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
        onClick?.()
        impact('light')
      }}>
      {content}
    </Link>
  )
}
