import {
  Banknote,
  ChartPie,
  Home,
  House,
  Menu,
  PiggyBank,
  Settings,
} from 'lucide-react'

import { PATHS } from './paths'

export const APP_MENU_ITEMS = [
  { to: PATHS.APP_ROOT, labelKey: 'shell.protected.nav.overview', icon: Home },
  {
    to: PATHS.EXPENSES,
    labelKey: 'shell.protected.nav.expenses',
    icon: Banknote,
  },
  {
    to: PATHS.BUDGETS,
    labelKey: 'shell.protected.nav.budgets',
    icon: PiggyBank,
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
    to: PATHS.SETTINGS,
    labelKey: 'shell.protected.nav.settings',
    icon: Settings,
  },
  {
    to: PATHS.MORE,
    labelKey: 'shell.protected.nav.more',
    icon: Menu,
  },
] as const

export const BOTTOM_TAB_ITEMS = [
  { to: PATHS.APP_ROOT, labelKey: 'shell.protected.nav.overview', icon: Home },
  {
    to: PATHS.EXPENSES,
    labelKey: 'shell.protected.nav.expenses',
    icon: Banknote,
  },
  {
    to: PATHS.BUDGETS,
    labelKey: 'shell.protected.nav.budgets',
    icon: PiggyBank,
  },
  {
    to: PATHS.INSIGHTS,
    labelKey: 'shell.protected.nav.insights',
    icon: ChartPie,
  },
  { to: PATHS.MORE, labelKey: 'shell.protected.nav.more', icon: Menu },
] as const
