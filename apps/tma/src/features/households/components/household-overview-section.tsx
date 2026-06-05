import { FinanceSummaryCard } from '@/features/finance/components'

type HouseholdOverviewSectionProps = {
  householdId: string
}

export const HouseholdOverviewSection = ({
  householdId,
}: HouseholdOverviewSectionProps) => (
  <FinanceSummaryCard householdId={householdId} title='Tổng quan kỳ này' />
)
