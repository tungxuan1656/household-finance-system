import { useNavigate } from 'react-router-dom'

import {
  TmaInlineAction,
  TmaMonogramBadge,
} from '@/components/shared/tma-page-shell'
import {
  useExpenseListQuery,
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
  getExpenseGroupLabel,
  getExpenseSecondaryText,
} from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatTimeLabel } from '@/lib/formatters'
import { selection } from '@/lib/telegram/haptics'

export const HomeRecentExpensesSection = () => {
  const navigate = useNavigate()
  const recentExpensesQuery = useExpenseListQuery({
    limit: 10,
    sort: 'occurred_at_desc',
  })
  const householdsQuery = useHouseholdsQuery()
  const referenceCategoriesQuery = useReferenceCategoriesQuery()

  const recentExpenses = recentExpensesQuery.data?.items ?? []
  const referenceCategories = referenceCategoriesQuery.data?.items
  const householdNameById = new Map(
    (householdsQuery.data?.items ?? []).map((household) => [
      household.id,
      household.name,
    ]),
  )

  return (
    <section className='tma-section'>
      <div className='tma-section__header'>
        <h2 className='tma-section__title'>Lịch sử gần đây</h2>
        <TmaInlineAction href={TMA_PATHS.expenses}>Xem tất cả</TmaInlineAction>
      </div>

      {recentExpensesQuery.isError && recentExpenses.length === 0 ? (
        <div className='tma-empty-card'>
          <h2>Không tải được lịch sử chi tiêu</h2>
          <p>
            API chi tiêu đang lỗi hoặc account hiện tại chưa thấy dữ liệu
            household đã seed.
          </p>
        </div>
      ) : recentExpenses.length === 0 ? (
        <div className='tma-empty-card'>
          <h2>
            {recentExpensesQuery.isLoading
              ? 'Đang tải lịch sử chi tiêu'
              : 'Chưa có chi tiêu gần đây'}
          </h2>
          <p>
            {recentExpensesQuery.isLoading
              ? 'Danh sách sẽ xuất hiện ngay khi truy vấn đầu tiên hoàn tất.'
              : 'Tạo giao dịch mới hoặc seed local để home-page hiện dữ liệu thật.'}
          </p>
        </div>
      ) : (
        <div className='tma-list-card'>
          {recentExpenses.map((expense) => {
            const category = getCategoryPresentation(
              expense.categoryKey,
              referenceCategories,
            )
            const groupLabel = getExpenseGroupLabel(expense.groupIds)
            const householdLabel = expense.householdId
              ? householdNameById.get(expense.householdId)
              : null

            return (
              <article
                key={expense.id}
                className='tma-expense-row'
                role='button'
                tabIndex={0}
                onClick={() => {
                  selection()
                  navigate(`/expenses/${expense.id}`)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    selection()
                    navigate(`/expenses/${expense.id}`)
                  }
                }}>
                <TmaMonogramBadge
                  accent={category.accent}
                  label={category.symbol}
                  size='sm'
                />
                <div className='tma-expense-row__body'>
                  <div className='tma-expense-row__title-line'>
                    <h3>{expense.title.trim() || category.label}</h3>
                    <strong className='font-mono'>
                      {formatCurrencyMinor(
                        expense.amountMinor,
                        expense.currencyCode,
                      )}
                    </strong>
                  </div>
                  <p>{getExpenseSecondaryText(expense.note, category.label)}</p>
                  <div className='tma-expense-row__meta'>
                    <span>
                      {formatTimeLabel(
                        new Date(expense.occurredAt).toISOString(),
                      )}
                    </span>
                    {householdLabel ? <span>{householdLabel}</span> : null}
                    {groupLabel ? <span>{groupLabel}</span> : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
