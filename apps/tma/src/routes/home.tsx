import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import {
  FinanceSummaryCard,
  HouseholdPreviewCarousel,
} from '@/components/finance'
import { AppVersionLabel } from '@/components/shared/app-version-label'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { HomeRecentExpensesSection } from '@/features/home/components/home-recent-expenses-section'
import { HomeShortcutsSection } from '@/features/home/components/home-shortcuts-section'
import { usePeriodStore } from '@/features/period/store'

export const HomePage = () => {
  const { t } = useTranslation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)

  // Idle prefetch: after the home page is interactive, start loading chunks
  // for the most likely next routes so navigation feels instant.
  useEffect(() => {
    const id = setTimeout(() => {
      // Dynamic import triggers Vite to load the lazy chunk in the background.
      // Errors are swallowed — prefetch is a best-effort optimisation.
      void import('@/routes/statistics').catch(() => undefined)
      void import('@/routes/expenses').catch(() => undefined)
      void import('@/routes/incomes').catch(() => undefined)
    }, 2_000)

    return () => clearTimeout(id)
  }, [])

  return (
    <TmaPageShell title={t('homePage.title')}>
      {/* Single spacing owner: parent flex gap owns vertical rhythm, children must not leak mt-* */}
      <div className='flex flex-col gap-6'>
        <FinanceSummaryCard showBudgetPeriodContext />
        <HomeShortcutsSection />
        <HouseholdPreviewCarousel />
        <HomeRecentExpensesSection
          dateFrom={selectedPeriod.dateFrom}
          dateTo={selectedPeriod.dateTo}
          title={t('home.recentExpensesTitle')}
        />
        <AppVersionLabel className='pt-2' />
      </div>
    </TmaPageShell>
  )
}
