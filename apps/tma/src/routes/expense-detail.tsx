import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  Eyebrow,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
import {
  useDeleteExpenseMutation,
  useExpenseDetailQuery,
} from '@/features/expenses/api'
import {
  buildHouseholdNameMap,
  getSourceLabel,
} from '@/features/expenses/presentation'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
} from '@/features/home/presentation'
import { getExpenseEditPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel, formatTimeLabel } from '@/lib/formatters'
import { impact, notification, selection } from '@/lib/telegram/haptics'

export const ExpenseDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const expenseId = id ?? 'unknown'
  const expenseQuery = useExpenseDetailQuery(expenseId, {
    enabled: expenseId !== 'unknown',
  })
  const categoriesQuery = useReferenceCategoriesQuery()
  const householdsQuery = useHouseholdsQuery()
  const deleteMutation = useDeleteExpenseMutation()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const expense = expenseQuery.data
  const householdNameMap = useMemo(
    () => buildHouseholdNameMap(householdsQuery.data?.items ?? []),
    [householdsQuery.data?.items],
  )
  const category = getCategoryPresentation(
    expense?.categoryKey,
    categoriesQuery.data?.items ?? [],
  )

  const handleDelete = async () => {
    if (!expense) return

    try {
      impact('heavy')

      await deleteMutation.mutateAsync(expense.id)
      notification('success')
      navigate(TMA_PATHS.expenses, { replace: true })
    } catch {
      notification('error')
    }
  }

  if (expenseQuery.isLoading || categoriesQuery.isLoading) {
    return (
      <TmaPageShell title='Chi tiết'>
        <Card>
          <CardDescription>Đang tải thông tin chi tiêu...</CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  if (expenseQuery.isError || !expense) {
    return (
      <TmaPageShell title='Chi tiết'>
        <Card>
          <CardDescription>
            Không tìm thấy khoản chi này hoặc bạn không có quyền truy cập.
          </CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  const dateLabel = formatDateLabel(new Date(expense.occurredAt).toISOString())
  const timeLabel = formatTimeLabel(new Date(expense.occurredAt).toISOString())
  const spaceLabel = expense.householdId
    ? householdNameMap.get(expense.householdId) || 'Gia đình'
    : 'Cá nhân'

  return (
    <TmaPageShell title='Chi tiết'>
      {/* Hero */}
      <Card className='mb-3 flex items-center gap-4 p-5'>
        <TmaCategoryIconBadge
          accent={category.accent}
          iconUrl={category.iconUrl}
          symbol={category.symbol}
        />
        <div className='min-w-0 flex-1'>
          <Eyebrow>Số tiền đã chi</Eyebrow>
          <MoneyLabel className='mt-1 block text-[32px] leading-none font-extrabold'>
            {formatCurrencyMinor(expense.amountMinor, expense.currencyCode)}
          </MoneyLabel>
        </div>
      </Card>

      {/* Info */}
      <Section>
        <SectionHeader title='Thông tin' />
        <Card className='grid gap-3'>
          <div className='flex items-center gap-3'>
            <TmaCategoryIconBadge
              accent={category.accent}
              iconUrl={category.iconUrl}
              size='sm'
              symbol={category.symbol}
            />
            <div>
              <Eyebrow>Danh mục</Eyebrow>
              <strong className='text-sm font-semibold text-tma-text-strong'>
                {category.label}
              </strong>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='grid gap-1'>
              <Eyebrow>Nguồn tiền</Eyebrow>
              <strong className='text-sm font-semibold text-tma-text-strong'>
                {getSourceLabel(expense.sourceKey)}
              </strong>
            </div>
            <div className='grid gap-1'>
              <Eyebrow>Không gian</Eyebrow>
              <strong className='text-sm font-semibold text-tma-text-strong'>
                {spaceLabel}
              </strong>
            </div>
          </div>
        </Card>
      </Section>

      {/* Date & Time */}
      <Section>
        <SectionHeader title='Thời gian' />
        <Card className='grid gap-1'>
          <Eyebrow>Ngày & giờ</Eyebrow>
          <strong className='text-base font-semibold text-tma-text-strong'>
            {dateLabel}, {timeLabel}
          </strong>
        </Card>
      </Section>

      {/* Actions */}
      {showDeleteConfirm ? (
        <Card className='mt-3 grid gap-3 border-[#d93838]/20 bg-[#ffeded]/90'>
          <div>
            <Eyebrow className='text-[#d93838]'>Xác nhận xóa</Eyebrow>
            <strong className='text-sm font-semibold text-tma-text-strong'>
              Bạn có chắc chắn muốn xóa khoản chi này? Thao tác này không thể
              hoàn tác.
            </strong>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <Button
              disabled={deleteMutation.isPending}
              variant='danger'
              onClick={handleDelete}>
              Xóa vĩnh viễn
            </Button>
            <Button
              variant='ghost'
              onClick={() => {
                selection()
                setShowDeleteConfirm(false)
              }}>
              Hủy
            </Button>
          </div>
        </Card>
      ) : (
        <div className='mt-6 grid grid-cols-2 gap-3'>
          <Button
            variant='outline'
            onClick={() => {
              selection()
              navigate(getExpenseEditPath(expense.id))
            }}>
            Sửa chi tiêu
          </Button>
          <Button
            className='bg-[#d93838]/10 text-[#d93838]'
            variant='ghost'
            onClick={() => {
              selection()
              setShowDeleteConfirm(true)
            }}>
            Xóa chi tiêu
          </Button>
        </div>
      )}
    </TmaPageShell>
  )
}
