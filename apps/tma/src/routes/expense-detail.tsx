import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
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
import { formatDateLabel, formatTimeLabel } from '@/lib/formatters'
import { impact, notification, selection } from '@/lib/telegram/haptics'

export const ExpenseDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const expenseId = id ?? 'unknown'

  // Queries
  const expenseQuery = useExpenseDetailQuery(expenseId, {
    enabled: expenseId !== 'unknown',
  })
  const categoriesQuery = useReferenceCategoriesQuery()
  const householdsQuery = useHouseholdsQuery()

  const expense = expenseQuery.data
  const referenceCategories = categoriesQuery.data?.items ?? []
  const households = householdsQuery.data?.items ?? []

  const deleteMutation = useDeleteExpenseMutation()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Map values
  const householdNameMap = useMemo(
    () => buildHouseholdNameMap(households),
    [households],
  )

  const category = getCategoryPresentation(
    expense?.categoryKey,
    referenceCategories,
  )

  const handleDelete = async () => {
    if (!expense) return
    try {
      impact('heavy')
      await deleteMutation.mutateAsync(expense.id)
      notification('success')
      navigate('/expenses', { replace: true })
    } catch {
      notification('error')
    }
  }

  // Safe area / UI status check
  if (expenseQuery.isLoading || categoriesQuery.isLoading) {
    return (
      <TmaPageShell title='Chi tiết'>
        <div className='tma-empty-card'>
          <h2>Đang tải thông tin chi tiêu...</h2>
          <p>Dữ liệu chi tiết sẽ xuất hiện ngay sau đây.</p>
        </div>
      </TmaPageShell>
    )
  }

  if (expenseQuery.isError || !expense) {
    return (
      <TmaPageShell title='Chi tiết'>
        <div className='tma-empty-card'>
          <h2>Lỗi tải chi tiết</h2>
          <p>Không tìm thấy khoản chi này hoặc bạn không có quyền truy cập.</p>
        </div>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title='Chi tiết'>
      <div className='tma-detail-view'>
        <TmaPageHeader
          eyebrow={category.label.toUpperCase()}
          subtitle={expense.title || category.label}
          title='Chi tiết chi tiêu'
        />

        {/* Hero Card */}
        <section className='tma-summary-card mb-5'>
          <div className='tma-summary-card__topline'>
            <div>
              <p className='tma-section-label'>SỐ TIỀN ĐÃ CHI</p>
              <strong className='font-mono text-[32px]'>
                {formatCurrencyMinor(expense.amountMinor, expense.currencyCode)}
              </strong>
            </div>
            <TmaMonogramBadge
              accent={category.accent}
              label={category.symbol}
            />
          </div>

          <div className='mt-3 border-t border-tma-line pt-3'>
            <p className='tma-section-label'>MÔ TẢ</p>
            <p className='mt-1 text-sm leading-relaxed text-tma-text-strong'>
              {expense.note || 'Không có mô tả.'}
            </p>
          </div>
        </section>

        {/* Grid Card */}
        <section className='tma-preview-card mb-5'>
          <div className='tma-preview-card__grid'>
            <div>
              <span>Danh mục</span>
              <strong>{category.label}</strong>
            </div>
            <div>
              <span>Nguồn tiền</span>
              <strong>{getSourceLabel(expense.sourceKey)}</strong>
            </div>
            <div>
              <span>Ngày chi</span>
              <strong>
                {formatDateLabel(new Date(expense.occurredAt).toISOString())}
              </strong>
            </div>
            <div>
              <span>Giờ chi</span>
              <strong>
                {formatTimeLabel(new Date(expense.occurredAt).toISOString())}
              </strong>
            </div>
            <div>
              <span>Không gian</span>
              <strong>
                {expense.householdId
                  ? householdNameMap.get(expense.householdId) || 'Gia đình'
                  : 'Cá nhân'}
              </strong>
            </div>
            <div>
              <span>Thời điểm ghi</span>
              <strong>
                {formatDateLabel(new Date(expense.createdAt).toISOString())}
              </strong>
            </div>
          </div>
        </section>

        {/* Delete Confirmation Block */}
        {showDeleteConfirm ? (
          <section
            className='tma-inline-banner mt-5 flex flex-col gap-3'
            style={{
              border: '1px solid rgba(255, 63, 63, 0.2)',
              background: 'rgba(255, 237, 237, 0.88)',
            }}>
            <div>
              <p className='tma-section-label text-[#d93838]'>XÁC NHẬN XÓA</p>
              <strong className='text-sm font-semibold'>
                Bạn có chắc chắn muốn xóa khoản chi này? Thao tác này không thể
                hoàn tác.
              </strong>
            </div>
            <div className='flex gap-2'>
              <button
                className='tma-chip-button w-full justify-center border-0 p-2.5 text-white'
                style={{ background: '#d93838' }}
                type='button'
                onClick={handleDelete}>
                Xóa vĩnh viễn
              </button>
              <button
                className='tma-chip-button w-full justify-center p-2.5 text-tma-text-strong'
                style={{ background: 'rgba(17, 24, 39, 0.06)' }}
                type='button'
                onClick={() => {
                  selection()
                  setShowDeleteConfirm(false)
                }}>
                Hủy
              </button>
            </div>
          </section>
        ) : (
          // Action Buttons
          <div className='mt-6 grid grid-cols-2 gap-3'>
            <button
              className='tma-select-chip justify-center rounded-[18px] bg-tma-primary/12 p-3.5 font-semibold text-tma-primary'
              type='button'
              onClick={() => {
                selection()
                navigate(`/expenses/${expense.id}/edit`)
              }}>
              Sửa chi tiêu
            </button>
            <button
              className='tma-select-chip justify-center rounded-[18px] p-3.5 font-semibold text-[#d93838]'
              style={{ background: 'rgba(255, 63, 63, 0.08)' }}
              type='button'
              onClick={() => {
                selection()
                setShowDeleteConfirm(true)
              }}>
              Xóa chi tiêu
            </button>
          </div>
        )}
      </div>
    </TmaPageShell>
  )
}
