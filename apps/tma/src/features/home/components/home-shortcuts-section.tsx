import type { ReactElement, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'

import { ShortcutItem } from '@/components/finance'
import {
  BudgetIcon,
  GroupIcon,
  HouseholdIcon,
  ReceiptIcon,
} from '@/components/shared/tma-icons'
import { Section } from '@/components/ui'
import { TMA_PATHS } from '@/lib/constants/routes'

export const HomeShortcutsSection = () => {
  const { t } = useTranslation()

  const shortcutItems = [
    {
      title: t('home.shortcuts.expense'),
      href: TMA_PATHS.expenses,
      icon: ReceiptIcon,
      accent: { background: '#edf4ff', foreground: '#3f7cff' },
      enabled: true,
    },
    {
      title: t('home.shortcuts.household'),
      href: TMA_PATHS.households,
      icon: HouseholdIcon,
      accent: { background: '#eef9f0', foreground: '#2f9b44' },
      enabled: true,
    },
    {
      title: t('home.shortcuts.group'),
      href: TMA_PATHS.groups,
      icon: GroupIcon,
      accent: { background: '#fff3e8', foreground: '#ff8a3d' },
      enabled: true,
    },
    {
      title: t('home.shortcuts.budget'),
      href: TMA_PATHS.budgets,
      icon: BudgetIcon,
      accent: { background: '#fff6d9', foreground: '#b48800' },
      enabled: true,
    },
  ] as const satisfies Array<{
    accent: { background: string; foreground: string }
    enabled: boolean
    href: string
    icon: (props: SVGProps<SVGSVGElement>) => ReactElement
    title: string
  }>

  return (
    <Section>
      <div className='grid grid-cols-2 gap-2.5'>
        {shortcutItems.map((item) => (
          <ShortcutItem
            key={item.title}
            accent={item.accent}
            disabled={!item.enabled}
            href={item.href}
            icon={item.icon}
            title={item.title}
          />
        ))}
      </div>
    </Section>
  )
}
