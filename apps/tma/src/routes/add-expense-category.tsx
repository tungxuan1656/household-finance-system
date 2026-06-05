import { useNavigate } from 'react-router-dom'

import { CalendarIcon } from '@/components/shared/tma-icons'
import {
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { useAddExpenseFlowStore } from '@/features/expenses/store'
import { categoryOptions } from '@/features/finance/mock-data'
import { formatDateLabel } from '@/lib/formatters'
import { selection } from '@/lib/telegram/haptics'

export const AddExpenseCategoryPage = () => {
  const navigate = useNavigate()
  const date = useAddExpenseFlowStore((state) => state.date)
  const setDate = useAddExpenseFlowStore((state) => state.setDate)
  const selectCategory = useAddExpenseFlowStore((state) => state.selectCategory)

  return (
    <TmaPageShell showBottomTabs={false} title='Thêm chi tiêu'>
      <TmaPageHeader eyebrow='Bước 1/3' title='Bắt đầu từ phần dễ nhất' />
      <section className='tma-step-card'>
        <label className='tma-date-pill'>
          <CalendarIcon height='18' width='18' />
          <div>
            <span>Ngày chi tiêu</span>
            <strong>{formatDateLabel(date)}</strong>
          </div>
          <input
            type='date'
            value={date.slice(0, 10)}
            onChange={(event) => {
              selection()

              const nextDate = new Date(
                `${event.target.value}T12:00:00+07:00`,
              ).toISOString()
              setDate(nextDate)
            }}
          />
        </label>
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Danh mục</p>
            <h2 className='tma-section__title'>
              Nhấn một lần là sang bước tiếp
            </h2>
          </div>
        </div>

        <div className='tma-category-grid'>
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              className='tma-category-card'
              type='button'
              onClick={() => {
                selection()
                selectCategory(category)
                navigate('/expenses/new/details')
              }}>
              <TmaMonogramBadge
                accent={category.accent}
                label={category.symbol}
              />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </section>
    </TmaPageShell>
  )
}
