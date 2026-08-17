import type { ReactElement, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

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
        <span
          aria-hidden='true'
          className='grid size-10 shrink-0 place-items-center rounded-[14px] font-bold'
          style={{
            backgroundColor: accent.background,
            color: accent.foreground,
          }}>
          <Icon height={20} strokeWidth={2.1} width={20} />
        </span>
        {disabled ? (
          <span className='inline-flex min-h-6 items-center gap-1.5 rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-800'>
            {t('shortcuts.comingSoon')}
          </span>
        ) : null}
      </div>
      <div>
        <h3 className='m-0 text-[15px] leading-tight font-semibold text-foreground'>
          {title}
        </h3>
      </div>
    </>
  )

  const className =
    'flex items-center content-start gap-3 rounded-3xl border border-black/4 bg-white p-3.5 shadow-sm transition active:scale-[0.98]'

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
