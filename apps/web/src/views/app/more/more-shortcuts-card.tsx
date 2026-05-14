'use client'

import {
  ArrowRight,
  Compass,
  House,
  type LucideIcon,
  Settings,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

type ShortcutRow = {
  href: string
  label: string
  description: string
  Icon: LucideIcon
}

const getShortcutRows = (): ShortcutRow[] => [
  {
    href: PATHS.ADD_EXPENSE,
    label: t('expense.addTitle'),
    description: t('app.more.shortcuts.addExpenseDescription'),
    Icon: Sparkles,
  },
  {
    href: PATHS.HOUSEHOLDS,
    label: t('app.more.links.households'),
    description: t('app.more.shortcuts.householdsDescription'),
    Icon: House,
  },
  {
    href: PATHS.SETTINGS,
    label: t('app.more.links.settings'),
    description: t('app.more.shortcuts.settingsDescription'),
    Icon: Settings,
  },
  {
    href: PATHS.ONBOARDING,
    label: t('app.more.links.onboarding'),
    description: t('app.more.shortcuts.onboardingDescription'),
    Icon: Compass,
  },
]

export const MoreShortcutsCard = () => {
  const rows = getShortcutRows()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('app.more.quickLinks.title')}</CardTitle>
        <CardDescription>
          {t('app.more.quickLinks.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        {rows.map(({ href, label, description, Icon }, index) => (
          <div key={href}>
            {index > 0 ? <Separator className='my-1' /> : null}
            <Link
              className='flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
              href={href}>
              <Icon
                aria-hidden='true'
                className='size-4 text-muted-foreground'
              />
              <span className='flex min-w-0 flex-1 flex-col'>
                <span className='truncate font-medium'>{label}</span>
                <span className='truncate text-sm text-muted-foreground'>
                  {description}
                </span>
              </span>
              <ArrowRight
                aria-hidden='true'
                className='size-4 text-muted-foreground'
              />
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
