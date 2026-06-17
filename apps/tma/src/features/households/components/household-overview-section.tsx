import { useTranslation } from 'react-i18next'

import { FinanceSummaryCard } from '@/components/finance'

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
