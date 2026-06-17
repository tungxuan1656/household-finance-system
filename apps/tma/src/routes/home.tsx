import { useTranslation } from 'react-i18next'

import {
  FinanceSummaryCard,
  HouseholdPreviewCarousel,
} from '@/components/finance'
import { TmaPageHeader, TmaPageShell } from '@/components/shared/tma-page-shell'
import { useAuth } from '@/features/auth/auth-provider'
import { HomeRecentExpensesSection } from '@/features/home/components/home-recent-expenses-section'
import { HomeShortcutsSection } from '@/features/home/components/home-shortcuts-section'
import { resolveUserName } from '@/features/home/presentation'
import { PeriodChipLink } from '@/features/period/components/period-chip-link'

export const HomePage = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const userName = resolveUserName(
    t,
    user?.displayName ?? null,
    user?.email ?? null,
  )

  return (
    <TmaPageShell title={t('homePage.title')}>
      <TmaPageHeader title={userName} trailing={<PeriodChipLink />} />

      <FinanceSummaryCard showBudgetPeriodContext showPeriodChip={false} />
      <HomeShortcutsSection />
      <HouseholdPreviewCarousel />
      <HomeRecentExpensesSection />
    </TmaPageShell>
  )
}
