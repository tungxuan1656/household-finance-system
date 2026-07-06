import { useEffect } from 'react'
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
