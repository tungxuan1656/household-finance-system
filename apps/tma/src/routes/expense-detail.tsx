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
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
} from '@/features/home/presentation'
import { formatDateLabel, formatTimeLabel } from '@/lib/formatters'
import { impact, notification, selection } from '@/lib/telegram/haptics'

const getSourceLabel = (key: string): string => {
  switch (key) {
    case 'cash':
      return 'Tiền mặt'
    case 'bank-transfer':
      return 'Chuyển khoản'
    case 'card':
      return 'Thẻ tín dụng'
    case 'momo':
      return 'Ví MoMo'
    case 'zalo-pay':
      return 'Ví ZaloPay'
    case 'shopee-pay':
      return 'Ví ShopeePay'
    default:
      return 'Khác'
  }
}

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
    () => new Map(households.map((h) => [h.id, h.name])),
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
      <TmaPageShell showBackButton title='Chi tiết'>
        <div className='tma-empty-card'>
          <h2>Đang tải thông tin chi tiêu...</h2>
          <p>Dữ liệu chi tiết sẽ xuất hiện ngay sau đây.</p>
        </div>
      </TmaPageShell>
    )
  }

  if (expenseQuery.isError || !expense) {
    return (
      <TmaPageShell showBackButton title='Chi tiết'>
        <div className='tma-empty-card'>
          <h2>Lỗi tải chi tiết</h2>
          <p>Không tìm thấy khoản chi này hoặc bạn không có quyền truy cập.</p>
        </div>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell showBackButton title='Chi tiết'>
      <div className='tma-detail-view'>
        <TmaPageHeader
          eyebrow={category.label.toUpperCase()}
          subtitle={expense.title || category.label}
          title='Chi tiết chi tiêu'
        />

        {/* Hero Card */}
        <section className='tma-summary-card' style={{ marginBottom: '20px' }}>
          <div className='tma-summary-card__topline'>
            <div>
              <p className='tma-section-label'>SỐ TIỀN ĐÃ CHI</p>
              <strong className='font-mono' style={{ fontSize: '32px' }}>
                {formatCurrencyMinor(expense.amountMinor, expense.currencyCode)}
              </strong>
            </div>
            <TmaMonogramBadge
              accent={category.accent}
              label={category.symbol}
            />
          </div>

          <div
            style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--tma-line)',
            }}>
            <p className='tma-section-label'>MÔ TẢ</p>
            <p
              style={{
                color: 'var(--tma-text-strong)',
                fontSize: '14px',
                marginTop: '4px',
                lineHeight: 1.5,
              }}>
              {expense.note || 'Không có mô tả.'}
            </p>
          </div>
        </section>

        {/* Grid Card */}
        <section className='tma-preview-card' style={{ marginBottom: '20px' }}>
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
            className='tma-inline-banner'
            style={{
              marginTop: '20px',
              border: '1px solid rgba(255, 63, 63, 0.2)',
              background: 'rgba(255, 237, 237, 0.88)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
            <div>
              <p className='tma-section-label' style={{ color: '#d93838' }}>
                XÁC NHẬN XÓA
              </p>
              <strong style={{ fontSize: '14px', fontWeight: 600 }}>
                Bạn có chắc chắn muốn xóa khoản chi này? Thao tác này không thể
                hoàn tác.
              </strong>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className='tma-chip-button'
                style={{
                  background: '#d93838',
                  color: '#ffffff',
                  border: 'none',
                  flex: 1,
                  justifyContent: 'center',
                  padding: '10px',
                }}
                type='button'
                onClick={handleDelete}>
                Xóa vĩnh viễn
              </button>
              <button
                className='tma-chip-button'
                style={{
                  background: 'rgba(17, 24, 39, 0.06)',
                  color: 'var(--tma-text-strong)',
                  flex: 1,
                  justifyContent: 'center',
                  padding: '10px',
                }}
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
          <div
            style={{
              marginTop: '24px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}>
            <button
              className='tma-select-chip'
              style={{
                background: 'rgba(63, 124, 255, 0.12)',
                color: 'var(--tma-primary)',
                justifyContent: 'center',
                padding: '14px',
                borderRadius: '18px',
                fontWeight: 600,
              }}
              type='button'
              onClick={() => {
                selection()
                navigate(`/expenses/${expense.id}/edit`)
              }}>
              Sửa chi tiêu
            </button>
            <button
              className='tma-select-chip'
              style={{
                background: 'rgba(255, 63, 63, 0.08)',
                color: '#d93838',
                justifyContent: 'center',
                padding: '14px',
                borderRadius: '18px',
                fontWeight: 600,
              }}
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
