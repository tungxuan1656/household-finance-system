import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { DotsIcon, FilterIcon } from '@/components/shared/tma-icons'
import {
  TmaMonogramBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { buildHouseholdNameMap } from '@/features/expenses/presentation'
import {
  useExpenseListQuery,
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
} from '@/features/home/presentation'
import { formatDateLabel, formatTimeLabel, formatVnd } from '@/lib/formatters'
import { impact, selection } from '@/lib/telegram/haptics'

interface ExpenseRouteState {
  savedExpense?: {
    title: string
    amount: number
  }
}

export const ExpensesPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showFilters, setShowFilters] = useState(false)
  const routeState = (location.state as ExpenseRouteState | null) ?? null

  const expensesQuery = useExpenseListQuery({
    sort: 'occurred_at_desc',
    limit: 50,
  })
  const referenceCategoriesQuery = useReferenceCategoriesQuery()
  const householdsQuery = useHouseholdsQuery()

  const expenses = expensesQuery.data?.items ?? []
  const referenceCategories = referenceCategoriesQuery.data?.items
  const households = householdsQuery.data?.items ?? []

  const householdNameMap = useMemo(
    () => buildHouseholdNameMap(households),
    [households],
  )

  const sections = useMemo(() => {
    const grouped = new Map<string, typeof expenses>()

    for (const expense of expenses) {
      const label = formatDateLabel(new Date(expense.occurredAt).toISOString())
      const current = grouped.get(label) ?? []

      grouped.set(label, [...current, expense])
    }

    return [...grouped.entries()]
  }, [expenses])

  if (expensesQuery.isLoading || referenceCategoriesQuery.isLoading) {
    return (
      <TmaPageShell showBackButton title='Chi tiêu'>
        <div className='tma-empty-card'>
          <h2>Đang tải danh sách chi tiêu</h2>
          <p>Danh sách sẽ xuất hiện ngay khi truy vấn hoàn tất.</p>
        </div>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell showBackButton title='Chi tiêu'>
      <div className='tma-page-toolbar'>
        <p className='tma-page-toolbar__copy'>
          Lịch sử đầy đủ, nhẹ để quét mắt và quay lại thật nhanh.
        </p>

        <button
          className='tma-chip-button'
          type='button'
          onClick={() => {
            selection()
            setShowFilters((v) => !v)
          }}>
          <FilterIcon height='16' width='16' />
          <span>Lọc</span>
        </button>
      </div>

      {routeState?.savedExpense ? (
        <section className='tma-inline-banner'>
          <p className='tma-section-label'>Preview đã lưu cục bộ</p>
          <strong>
            {routeState.savedExpense.title} •{' '}
            <span className='font-mono'>
              {formatVnd(routeState.savedExpense.amount)}
            </span>
          </strong>
        </section>
      ) : null}

      {showFilters ? (
        <section className='tma-filter-sheet'>
          <span className='tma-soft-pill'>Tháng này</span>
          <span className='tma-soft-pill'>Tất cả nguồn tiền</span>
          <span className='tma-soft-pill'>Gia đình + cá nhân</span>
        </section>
      ) : null}

      {expenses.length === 0 ? (
        <div className='tma-empty-card'>
          <h2>Chưa có chi tiêu nào</h2>
          <p>Ghi nhận chi tiêu đầu tiên để bắt đầu theo dõi.</p>
        </div>
      ) : (
        <section className='tma-timeline'>
          {sections.map(([label, items]) => (
            <div key={label} className='tma-timeline__section'>
              <div className='tma-timeline__label'>
                <span>{label}</span>
              </div>

              <div className='tma-list-stack'>
                {items.map((expense) => {
                  const category = getCategoryPresentation(
                    expense.categoryKey,
                    referenceCategories,
                  )
                  const householdLabel = expense.householdId
                    ? householdNameMap.get(expense.householdId)
                    : null

                  return (
                    <article
                      key={expense.id}
                      className='tma-expense-card'
                      role='button'
                      tabIndex={0}
                      onClick={() => {
                        selection()
                        navigate(`/expenses/${expense.id}`)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          selection()
                          navigate(`/expenses/${expense.id}`)
                        }
                      }}>
                      <TmaMonogramBadge
                        accent={category.accent}
                        label={category.symbol}
                      />
                      <div className='tma-expense-card__body'>
                        <div className='tma-expense-card__heading'>
                          <div>
                            <h3>{expense.title || category.label}</h3>
                            <p>{expense.note}</p>
                          </div>
                          <strong className='font-mono'>
                            {formatCurrencyMinor(
                              expense.amountMinor,
                              expense.currencyCode,
                            )}
                          </strong>
                        </div>

                        <div className='tma-expense-card__meta'>
                          <span>
                            {formatTimeLabel(
                              new Date(expense.occurredAt).toISOString(),
                            )}
                          </span>
                          {householdLabel ? (
                            <span>{householdLabel}</span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        className='tma-icon-button tma-icon-button--ghost'
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation()
                          impact('light')
                          navigate(`/expenses/${expense.id}`)
                        }}>
                        <DotsIcon height='18' width='18' />
                      </button>
                    </article>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      )}
    </TmaPageShell>
  )
}
