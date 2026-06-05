import { useMemo, useState } from 'react'

import { FilterIcon } from '@/components/shared/tma-icons'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Button, Card, CardDescription, CardTitle, Chip } from '@/components/ui'
import { buildHouseholdNameMap } from '@/features/expenses/presentation'
import { ExpenseTimeline } from '@/features/finance/components'
import {
  useExpenseListQuery,
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { selection } from '@/lib/telegram/haptics'

export const ExpensesPage = () => {
  const [showFilters, setShowFilters] = useState(false)
  const expensesQuery = useExpenseListQuery({
    sort: 'occurred_at_desc',
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
          size='sm'
          variant='outline'
          onClick={() => {
            selection()
            setShowFilters((v) => !v)
          }}>
          <FilterIcon height='16' width='16' />
          <span>Lọc</span>
        </Button>
      </div>

      {showFilters ? (
        <Card className='mb-3 flex flex-wrap gap-2'>
          <Chip>Tháng này</Chip>
          <Chip>Tất cả nguồn tiền</Chip>
          <Chip>Gia đình + cá nhân</Chip>
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
