import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { DotsIcon, FilterIcon } from '@/components/shared/tma-icons'
import {
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { findCategory, recentExpenses } from '@/features/finance/mock-data'
import { formatDateLabel, formatTimeLabel, formatVnd } from '@/lib/formatters'

interface ExpenseRouteState {
  savedExpense?: {
    title: string
    amount: number
  }
}

export const ExpensesPage = () => {
  const location = useLocation()
  const [showFilters, setShowFilters] = useState(false)
  const routeState = (location.state as ExpenseRouteState | null) ?? null

  const sections = useMemo(() => {
    const grouped = new Map<string, typeof recentExpenses>()

    for (const expense of recentExpenses) {
      const label = formatDateLabel(expense.occurredAt)
      const current = grouped.get(label) ?? []

      grouped.set(label, [...current, expense])
    }

    return [...grouped.entries()]
  }, [])

  return (
    <TmaPageShell
      showBackButton
      header={
        <TmaPageHeader
          subtitle='Lịch sử đầy đủ với nhịp hiển thị thoáng, đủ để quét mắt thật nhanh.'
          title='Chi tiêu'
          trailing={
            <button
              className='tma-chip-button'
              type='button'
              onClick={() => {
                setShowFilters((current) => !current)
              }}>
              <FilterIcon height='16' width='16' />
              <span>Lọc</span>
            </button>
          }
        />
      }>
      {routeState?.savedExpense ? (
        <section className='tma-inline-banner'>
          <p className='tma-section-label'>Preview đã lưu cục bộ</p>
          <strong>
            {routeState.savedExpense.title} •{' '}
            {formatVnd(routeState.savedExpense.amount)}
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

      <section className='tma-timeline'>
        {sections.map(([label, items]) => (
          <div key={label} className='tma-timeline__section'>
            <div className='tma-timeline__label'>
              <span>{label}</span>
            </div>

            <div className='tma-list-stack'>
              {items.map((expense) => {
                const category = findCategory(expense.categoryId)

                return (
                  <article key={expense.id} className='tma-expense-card'>
                    <TmaMonogramBadge
                      accent={category.accent}
                      label={category.symbol}
                    />
                    <div className='tma-expense-card__body'>
                      <div className='tma-expense-card__heading'>
                        <div>
                          <h3>{expense.title}</h3>
                          <p>{expense.note}</p>
                        </div>
                        <strong>{formatVnd(expense.amount)}</strong>
                      </div>

                      <div className='tma-expense-card__meta'>
                        <span>{formatTimeLabel(expense.occurredAt)}</span>
                        {expense.household ? (
                          <span>{expense.household}</span>
                        ) : null}
                        {expense.group ? <span>{expense.group}</span> : null}
                      </div>
                    </div>

                    <button
                      className='tma-icon-button tma-icon-button--ghost'
                      type='button'>
                      <DotsIcon height='18' width='18' />
                    </button>
                  </article>
                )
              })}
            </div>
          </div>
        ))}
      </section>
    </TmaPageShell>
  )
}
