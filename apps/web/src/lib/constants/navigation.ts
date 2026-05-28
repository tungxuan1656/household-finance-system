import {
  Banknote,
  ChartPie,
  House,
  type LucideIcon,
  UserCircle,
} from 'lucide-react'

import type { TranslationKey } from '@/lib/i18n/i18n-init'

import { PATHS } from './paths'

type ProtectedNavigationItem = {
  to: string
  labelKey: TranslationKey
  icon: LucideIcon
}

const PROTECTED_TAB_ITEMS: ProtectedNavigationItem[] = [
  {
    to: PATHS.EXPENSES,
    labelKey: 'shell.protected.nav.expenses',
    icon: Banknote,
  },
  {
    to: PATHS.INSIGHTS,
    labelKey: 'shell.protected.nav.insights',
    icon: ChartPie,
  },
  {
    to: PATHS.HOUSEHOLDS,
    labelKey: 'shell.protected.nav.households',
    icon: House,
  },
  {
    to: PATHS.ACCOUNT,
    labelKey: 'shell.protected.nav.account',
    icon: UserCircle,
  },
] as const

export const APP_MENU_ITEMS = PROTECTED_TAB_ITEMS
export const BOTTOM_TAB_ITEMS = PROTECTED_TAB_ITEMS

export const isProtectedNavItemActive = (
  pathname: string,
  itemPath: string,
) => {
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}
