import { useTranslation } from 'react-i18next'

import { FinanceSummaryCard } from '@/features/home/components/finance-summary-card'

type HouseholdOverviewSectionProps = {
  householdId: string
}

export const HouseholdOverviewSection = ({
  householdId,
}: HouseholdOverviewSectionProps) => {
  const { t } = useTranslation()

  return (
    <FinanceSummaryCard
      householdId={householdId}
      title={t('summary.overviewTitle')}
    />
  )
}
