import { RecentExpenses } from '@/features/finance/components'
import { TMA_PATHS } from '@/lib/constants/routes'

type HomeRecentExpensesSectionProps = {
  groupId?: string
  householdId?: string
  limit?: number
  showHouseholdLabel?: boolean
  title?: string
  viewAllHref?: string
}

export const HomeRecentExpensesSection = ({
  groupId,
  householdId,
  limit = 10,
  showHouseholdLabel = true,
  title = 'Lịch sử gần đây',
  viewAllHref = TMA_PATHS.expenses,
}: HomeRecentExpensesSectionProps) => (
  <RecentExpenses
    groupId={groupId}
    householdId={householdId}
    limit={limit}
    showHouseholdLabel={showHouseholdLabel}
    title={title}
    viewAllHref={viewAllHref}
  />
)
