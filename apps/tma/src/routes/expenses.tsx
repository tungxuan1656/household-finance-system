import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { FilterIcon } from '@/components/shared/tma-icons'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Button, Card, CardDescription, CardTitle, Chip } from '@/components/ui'
import {
  countActiveExpenseListFilters,
  useExpenseListFilterStore,
} from '@/features/expenses/filter-store'
import { buildHouseholdNameMap } from '@/features/expenses/presentation'
import { ExpenseTimeline } from '@/features/finance/components'
import {
  useExpenseListQuery,
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { TMA_PATHS } from '@/lib/constants/routes'
import { selection } from '@/lib/telegram/haptics'

export const ExpensesPage = () => {
  const navigate = useNavigate()
  const filter = useExpenseListFilterStore((state) => state.filter)
  const activeFilterCount = countActiveExpenseListFilters(filter)

  const queryParams = useMemo(
    () => ({
      sort: filter.sort,
      ...(filter.dateFrom != null ? { date_from: filter.dateFrom } : {}),
      ...(filter.dateTo != null ? { date_to: filter.dateTo } : {}),
      ...(filter.householdId != null
        ? { household_id: filter.householdId }
        : {}),
      ...(filter.categoryKey != null
        ? { category_key: filter.categoryKey }
        : {}),
    }),
    [filter],
  )

  const expensesQuery = useExpenseListQuery({
    ...queryParams,
    limit: 50,
  })
  const referenceCategoriesQuery = useReferenceCategoriesQuery()
  const householdsQuery = useHouseholdsQuery()

  const expenses = expensesQuery.data?.items ?? []
  const householdNameMap = useMemo(
    () => buildHouseholdNameMap(householdsQuery.data?.items ?? []),
    [householdsQuery.data?.items],
  )

  if (expensesQuery.isLoading || referenceCategoriesQuery.isLoading) {
    return (
      <TmaPageShell title='Chi tiêu'>
        <Card>
          <CardTitle>Đang tải danh sách chi tiêu</CardTitle>
          <CardDescription>
            Danh sách sẽ xuất hiện ngay khi truy vấn hoàn tất.
          </CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title='Chi tiêu'>
      <div className='flex items-start justify-between gap-3 px-1 py-2'>
        <CardDescription>
          Lịch sử đầy đủ, nhẹ để quét mắt và quay lại thật nhanh.
        </CardDescription>

        <Button
          aria-label='Mở bộ lọc'
          size='sm'
          variant={activeFilterCount > 0 ? 'primary' : 'outline'}
          onClick={() => {
            selection()
            navigate(TMA_PATHS.expensesFilter)
          }}>
          <FilterIcon height='16' width='16' />
          <span>
            Lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </span>
        </Button>
      </div>

      {activeFilterCount > 0 ? (
        <Card className='mb-3 flex flex-wrap gap-2'>
          {filter.dateFrom != null || filter.dateTo != null ? (
            <Chip tone='primary'>Đang lọc theo thời gian</Chip>
          ) : null}
          {filter.householdId != null ? (
            <Chip tone='primary'>
              Hộ: {householdNameMap.get(filter.householdId) ?? 'đã chọn'}
            </Chip>
          ) : null}
          {filter.categoryKey != null ? (
            <Chip tone='primary'>Danh mục đã chọn</Chip>
          ) : null}
          {filter.sort === 'amount_desc' ? (
            <Chip tone='primary'>Sắp xếp theo số tiền</Chip>
          ) : null}
        </Card>
      ) : null}

      {expenses.length === 0 ? (
        <Card>
          <CardTitle>Chưa có chi tiêu nào</CardTitle>
          <CardDescription>
            Ghi nhận chi tiêu đầu tiên để bắt đầu theo dõi.
          </CardDescription>
        </Card>
      ) : (
        <ExpenseTimeline
          expenses={expenses}
          householdNameById={householdNameMap}
          referenceCategories={referenceCategoriesQuery.data?.items}
        />
      )}
    </TmaPageShell>
  )
}
