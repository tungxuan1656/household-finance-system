import type { ReactElement, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
    <Card size='sm'>
      <CardHeader>
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
            <Badge variant='secondary'>{t('shortcuts.comingSoon')}</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <h3 className='text-[15px] leading-tight font-semibold'>{title}</h3>
      </CardContent>
    </Card>
  )

  if (disabled) {
    return (
      <div aria-disabled='true' className={cn('opacity-75')}>
        {content}
      </div>
    )
  }

  return (
    <Link
      className='transition active:scale-[0.98]'
      to={href}
      onClick={() => {
        onClick?.()
        impact('light')
      }}>
      {content}
    </Link>
  )
}
