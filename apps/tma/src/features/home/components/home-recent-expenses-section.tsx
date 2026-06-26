import { useTranslation } from 'react-i18next'

import { RecentExpenses } from '@/components/finance'
import { TMA_PATHS } from '@/lib/constants/routes'

type HomeRecentExpensesSectionProps = {
  groupId?: string
  householdId?: string
  limit?: number
  showHouseholdLabel?: boolean
  title?: string
  viewAllHref?: string
  viewAllState?: unknown
  dateFrom?: number
  dateTo?: number
}

export const HomeRecentExpensesSection = ({
  groupId,
  householdId,
  limit = 6,
  showHouseholdLabel = true,
  title: externalTitle,
  viewAllHref = TMA_PATHS.expenses,
  viewAllState,
  dateFrom,
  dateTo,
}: HomeRecentExpensesSectionProps) => {
  const { t } = useTranslation()
  const title = externalTitle ?? t('expensesList.defaultTitle')

  return (
    <RecentExpenses
      dateFrom={dateFrom}
      dateTo={dateTo}
      groupId={groupId}
      householdId={householdId}
      limit={limit}
      showHouseholdLabel={showHouseholdLabel}
      title={title}
      viewAllHref={viewAllHref}
      viewAllState={viewAllState}
    />
  )
}
