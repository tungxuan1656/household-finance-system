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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
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
      <CardContent className='px-2'>
        {rows.map(({ href, label, description, Icon }, index) => (
          <div key={href}>
            {index > 0 ? <ItemSeparator className='mx-3' /> : null}
            <Item asChild variant='default'>
              <Link href={href}>
                <ItemMedia
                  aria-hidden='true'
                  className='shrink-0 text-muted-foreground'
                  variant='icon'>
                  <Icon className='size-5' />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{label}</ItemTitle>
                  <ItemDescription>{description}</ItemDescription>
                </ItemContent>
                <ItemActions className='text-muted-foreground'>
                  <ArrowRight aria-hidden='true' className='size-4' />
                </ItemActions>
              </Link>
            </Item>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
