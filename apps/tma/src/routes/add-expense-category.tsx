import { useNavigate } from 'react-router-dom'

import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { ChipButton, DataState, Section, SectionHeader } from '@/components/ui'
import { DatePicker } from '@/components/ui/date-picker'
import { useAddExpenseFlowStore } from '@/features/expenses/store'
import { useReferenceCategoriesQuery } from '@/features/home/api'
import { getCategoryPresentation } from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'
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
      <DatePicker
        fullWidth
        aria-label='Ngày chi tiêu'
        className='mt-4'
        value={date.slice(0, 10)}
        onChange={(value) => {
          selection()

          const nextDate = new Date(`${value}T12:00:00+07:00`).toISOString()
          setDate(nextDate)
        }}
      />

      <Section>
        <SectionHeader title='Danh mục' />
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
                  navigate(TMA_PATHS.expensesNewDetails, { flushSync: true })
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
