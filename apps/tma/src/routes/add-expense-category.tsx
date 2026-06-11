import { useNavigate } from 'react-router-dom'

import { CalendarIcon } from '@/components/shared/tma-icons'
import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { ChipButton, DataState, Section, SectionHeader } from '@/components/ui'
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
      <label className='relative mt-4 flex items-center overflow-hidden rounded-[18px] bg-white p-3.5'>
        <CalendarIcon className='text-tma-text-muted' height='24' width='24' />
        <div className='ml-2 flex flex-1 items-center justify-between'>
          <span className='text-base font-medium text-tma-text-strong'>
            Ngày chi tiêu
          </span>
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

      <Section>
        <SectionHeader title='Chọn danh mục phù hợp' />
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
          <div className='grid grid-cols-3 gap-2'>
            {categoryOptions.map((category) => (
              <ChipButton
                key={category.id}
                aria-pressed={false}
                className='grid min-h-20 content-start'
                onClick={() => {
                  selection()
                  selectCategory(category)
                  navigate(TMA_PATHS.expensesNewDetails)
                }}>
                <TmaCategoryIconBadge
                  accent={category.accent}
                  iconUrl={category.iconUrl}
                  symbol={category.symbol}
                />
                <span className='text-xs font-semibold text-tma-text-strong'>
                  {category.label}
                </span>
              </ChipButton>
            ))}
          </div>
        </DataState>
      </Section>
    </TmaPageShell>
  )
}
