import { useTranslation } from 'react-i18next'

import { AppVersionLabel } from '@/components/shared/app-version-label'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { FinanceSummaryCard } from '@/features/home/components/finance-summary-card'
import { HomeRecentExpensesSection } from '@/features/home/components/home-recent-expenses-section'
import { HomeShortcutsSection } from '@/features/home/components/home-shortcuts-section'
import { HouseholdPreviewCarousel } from '@/features/home/components/household-preview-carousel'
import { usePeriodStore } from '@/features/period/store'

export const HomePage = () => {
  const { t } = useTranslation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)

  return (
    <TmaPageShell title={t('homePage.title')}>
      <FinanceSummaryCard showBudgetPeriodContext />
      <HomeShortcutsSection />
      <HouseholdPreviewCarousel />
      <HomeRecentExpensesSection
        dateFrom={selectedPeriod.dateFrom}
        dateTo={selectedPeriod.dateTo}
        title={t('home.recentExpensesTitle')}
      />
      <AppVersionLabel className='pt-2' />
    </TmaPageShell>
  )
}
