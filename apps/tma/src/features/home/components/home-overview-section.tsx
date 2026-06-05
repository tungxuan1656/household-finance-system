import { FinanceSummaryCard } from '@/features/finance/components'
import { getCurrentPeriod } from '@/lib/period'

export const HomeOverviewSection = () => (
  <FinanceSummaryCard period={getCurrentPeriod()} />
)
