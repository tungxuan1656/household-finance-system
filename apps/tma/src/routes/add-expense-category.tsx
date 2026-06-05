import { useNavigate } from 'react-router-dom'

import { CalendarIcon } from '@/components/shared/tma-icons'
import {
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  Card,
  CardTitle,
  DataState,
  Eyebrow,
  Section,
  SectionHeader,
} from '@/components/ui'
import { useAddExpenseFlowStore } from '@/features/expenses/store'
import { useReferenceCategoriesQuery } from '@/features/home/api'
import { getCategoryPresentation } from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel } from '@/lib/formatters'
import { selection } from '@/lib/telegram/haptics'

export const AddExpenseCategoryPage = () => {
  const navigate = useNavigate()
  const date = useAddExpenseFlowStore((state) => state.date)
  const setDate = useAddExpenseFlowStore((state) => state.setDate)
  const selectCategory = useAddExpenseFlowStore((state) => state.selectCategory)
  const categoriesQuery = useReferenceCategoriesQuery()
  const referenceCategories = categoriesQuery.data?.items ?? []
  const categoryOptions = referenceCategories
    .filter((category) => category.kind === 'expense')
    .map((category) => ({
      id: category.key,
      ...getCategoryPresentation(category.key, referenceCategories),
    }))

  return (
    <TmaPageShell title='Thêm chi tiêu'>
      <TmaPageHeader eyebrow='Bước 1/3' title='Bắt đầu từ phần dễ nhất' />
      <Card>
        <label className='relative flex items-center gap-3 overflow-hidden rounded-[18px] bg-black/[0.04] p-3.5'>
          <CalendarIcon
            className='text-tma-text-muted'
            height='18'
            width='18'
          />
          <div className='grid gap-1'>
            <span className='text-xs text-tma-text-muted'>Ngày chi tiêu</span>
            <strong className='text-tma-text-strong'>
              {formatDateLabel(date)}
            </strong>
          </div>
          <input
            className='absolute inset-0 opacity-0'
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
      </Card>

      <Section>
        <SectionHeader
          eyebrow='Danh mục'
          title='Nhấn một lần là sang bước tiếp'
        />
        <DataState
          emptyDescription='Reference categories chưa có danh mục chi tiêu khả dụng.'
          emptyTitle='Chưa có danh mục'
          errorDescription='Không tải được danh mục từ API. Kiểm tra kết nối rồi thử lại.'
          errorTitle='Không tải được danh mục'
          isEmpty={
            !categoriesQuery.isLoading &&
            !categoriesQuery.isError &&
            categoryOptions.length === 0
          }
          isError={categoriesQuery.isError && categoryOptions.length === 0}
          isLoading={categoriesQuery.isLoading && categoryOptions.length === 0}
          loadingDescription='Danh mục chi tiêu sẽ hiện ngay khi API trả về.'
          loadingTitle='Đang tải danh mục'
          retryAction={categoriesQuery.refetch}>
          <div className='grid grid-cols-2 gap-2.5'>
            {categoryOptions.map((category) => (
              <button
                key={category.id}
                className='grid min-h-28 content-start gap-3 rounded-[20px] border border-black/[0.04] bg-white p-3.5 text-left shadow-tma-soft transition active:scale-[0.98]'
                type='button'
                onClick={() => {
                  selection()
                  selectCategory(category)
                  navigate(TMA_PATHS.expensesNewDetails)
                }}>
                <TmaMonogramBadge
                  accent={category.accent}
                  label={category.symbol}
                />
                <div>
                  <Eyebrow>Danh mục</Eyebrow>
                  <CardTitle className='text-[15px]'>
                    {category.label}
                  </CardTitle>
                </div>
              </button>
            ))}
          </div>
        </DataState>
      </Section>
    </TmaPageShell>
  )
}
