import { FinanceSummaryCard } from '@/features/finance/components'
import { getCurrentPeriod } from '@/lib/period'

type HouseholdOverviewSectionProps = {
  householdId: string
}

export const HouseholdOverviewSection = ({
  householdId,
}: HouseholdOverviewSectionProps) => (
  <FinanceSummaryCard
    householdId={householdId}
    period={getCurrentPeriod()}
    title='Tổng quan tháng này'
  />
)
