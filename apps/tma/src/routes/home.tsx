import { useTranslation } from 'react-i18next'

import {
  FinanceSummaryCard,
  HouseholdPreviewCarousel,
} from '@/components/finance'
import { AppVersionLabel } from '@/components/shared/app-version-label'
import { TmaPageHeader, TmaPageShell } from '@/components/shared/tma-page-shell'
import { useAuth } from '@/features/auth/auth-provider'
import { HomeRecentExpensesSection } from '@/features/home/components/home-recent-expenses-section'
import { HomeShortcutsSection } from '@/features/home/components/home-shortcuts-section'
import { resolveUserName } from '@/features/home/presentation'
import { PeriodChipLink } from '@/features/period/components/period-chip-link'
import { usePeriodStore } from '@/features/period/store'

export const HomePage = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
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
      <HomeRecentExpensesSection
        dateFrom={selectedPeriod.dateFrom}
        dateTo={selectedPeriod.dateTo}
        title={t('home.recentExpensesTitle')}
      />
      <div className='mt-8'>
        <AppVersionLabel />
      </div>
    </TmaPageShell>
  )
}
