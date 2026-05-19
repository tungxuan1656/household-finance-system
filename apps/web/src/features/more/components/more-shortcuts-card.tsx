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
import { useAddExpenseDialog } from '@/features/expenses/components/add-expense/provider'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

type ShortcutRow = {
  label: string
  description: string
  Icon: LucideIcon
} & (
  | {
      kind: 'link'
      href: string
    }
  | {
      kind: 'action'
      onClick: () => void
    }
)

const getShortcutRows = (openDialog: () => void): ShortcutRow[] => [
  {
    kind: 'action',
    onClick: openDialog,
    label: t('expense.addTitle'),
    description: t('app.more.shortcuts.addExpenseDescription'),
    Icon: Sparkles,
  },
  {
    kind: 'link',
    href: PATHS.HOUSEHOLDS,
    label: t('app.more.links.households'),
    description: t('app.more.shortcuts.householdsDescription'),
    Icon: House,
  },
  {
    kind: 'link',
    href: PATHS.SETTINGS,
    label: t('app.more.links.settings'),
    description: t('app.more.shortcuts.settingsDescription'),
    Icon: Settings,
  },
  {
    kind: 'link',
    href: PATHS.ONBOARDING,
    label: t('app.more.links.onboarding'),
    description: t('app.more.shortcuts.onboardingDescription'),
    Icon: Compass,
  },
]

export const MoreShortcutsCard = () => {
  const { openDialog } = useAddExpenseDialog()
  const rows = getShortcutRows(openDialog)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('app.more.quickLinks.title')}</CardTitle>
        <CardDescription>
          {t('app.more.quickLinks.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2'>
        {rows.map((row, index) => (
          <div key={row.kind === 'link' ? row.href : row.label}>
            {index > 0 ? <ItemSeparator className='mx-3' /> : null}
            {row.kind === 'link' ? (
              <Item asChild variant='default'>
                <Link href={row.href}>
                  <ItemMedia
                    aria-hidden='true'
                    className='shrink-0 text-muted-foreground'
                    variant='icon'>
                    <row.Icon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{row.label}</ItemTitle>
                    <ItemDescription>{row.description}</ItemDescription>
                  </ItemContent>
                  <ItemActions className='text-muted-foreground'>
                    <ArrowRight aria-hidden='true' className='size-4' />
                  </ItemActions>
                </Link>
              </Item>
            ) : (
              <Item asChild variant='default'>
                <button
                  className='w-full text-left'
                  type='button'
                  onClick={row.onClick}>
                  <ItemMedia
                    aria-hidden='true'
                    className='shrink-0 text-muted-foreground'
                    variant='icon'>
                    <row.Icon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{row.label}</ItemTitle>
                    <ItemDescription>{row.description}</ItemDescription>
                  </ItemContent>
                  <ItemActions className='text-muted-foreground'>
                    <ArrowRight aria-hidden='true' className='size-4' />
                  </ItemActions>
                </button>
              </Item>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
