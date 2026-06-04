import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { CalendarIcon, CoinIcon, NoteIcon } from '@/components/shared/tma-icons'
import {
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  useDeleteExpenseMutation,
  useExpenseDetailQuery,
  useUpdateExpenseMutation,
} from '@/features/expenses/api'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
} from '@/features/home/presentation'
import { SOURCE_KEYS } from '@/features/home/types'
import {
  formatAmountInput,
  formatDateLabel,
  formatTimeLabel,
  parseAmountInput,
} from '@/lib/formatters'
import { hideBottomButton, setBottomButton } from '@/lib/telegram/bottom-button'
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

  // Mutation hooks
  const updateMutation = useUpdateExpenseMutation()
  const deleteMutation = useDeleteExpenseMutation()

  // State
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [note, setNote] = useState('')
  const [categoryKey, setCategoryKey] = useState('')
  const [sourceKey, setSourceKey] = useState('')
  const [dateString, setDateString] = useState('')
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Initialize edit fields when entering edit mode or when expense loads
  useEffect(() => {
    if (expense) {
      setTitle(expense.title)

      // Convert minor units to major units for user input
      const majorAmount = expense.amountMinor / 100
      setAmountInput(formatAmountInput(String(Math.round(majorAmount))))
      setNote(expense.note ?? '')
      setCategoryKey(expense.categoryKey)
      setSourceKey(expense.sourceKey)
      setDateString(new Date(expense.occurredAt).toISOString())
      setHouseholdId(expense.householdId)
    }
  }, [expense, isEditing])

  // Map values
  const householdNameMap = useMemo(
    () => new Map(households.map((h) => [h.id, h.name])),
    [households],
  )

  const category = getCategoryPresentation(
    expense?.categoryKey,
    referenceCategories,
  )

  const activeCategory = getCategoryPresentation(
    (categoryKey as any) || expense?.categoryKey,
    referenceCategories,
  )

  const amount = parseAmountInput(amountInput)
  const isValid = amount > 0 && title.trim().length > 0

  // Event handlers
  const handleSave = useEffectEvent(async () => {
    if (!isValid || !expense) {
      return
    }

    try {
      impact('medium')

      await updateMutation.mutateAsync({
        id: expense.id,
        payload: {
          title: title.trim(),
          amount,
          note: note.trim() || null,
          categoryKey: categoryKey as any,
          sourceKey: sourceKey as any,
          occurredAt: new Date(dateString).getTime(),
          householdId,
        },
      })

      notification('success')
      setIsEditing(false)
    } catch {
      notification('error')
    }
  })

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

  // Telegram BottomButton coordination
  useEffect(() => {
    if (!isEditing) {
      hideBottomButton()

      return
    }

    const cleanup = setBottomButton({
      text: 'Lưu thay đổi',
      enabled: isValid && !updateMutation.isPending,
      showProgress: updateMutation.isPending,
      onClick: () => {
        handleSave()
      },
    })

    return () => {
      cleanup()
      hideBottomButton()
    }
  }, [isEditing, isValid, updateMutation.isPending, handleSave])

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
    <TmaPageShell
      showBackButton
      reserveBottomButton={isEditing}
      showBottomTabs={!isEditing}
      title={isEditing ? 'Sửa chi tiêu' : 'Chi tiết'}>
      {isEditing ? (
        // EDIT MODE
        <div className='tma-edit-flow'>
          <TmaPageHeader
            eyebrow='Chế độ chỉnh sửa'
            subtitle='Thay đổi các thông tin và nhấn Lưu thay đổi.'
            title='Chỉnh sửa chi tiêu'
          />

          <section className='tma-step-summary'>
            <TmaMonogramBadge
              accent={activeCategory.accent}
              label={activeCategory.symbol}
            />
            <div>
              <strong>{activeCategory.label}</strong>
              <p>{formatDateLabel(dateString || new Date().toISOString())}</p>
            </div>
          </section>

          {/* Title Input */}
          <section className='tma-note-card'>
            <div className='tma-input-head'>
              <NoteIcon height='16' width='16' />
              <span>Tên chi tiêu *</span>
            </div>
            <input
              placeholder='Nhập tên khoản chi tiêu...'
              style={{
                width: '100%',
                border: 0,
                background: 'transparent',
                color: 'var(--tma-text-strong)',
                outline: 'none',
                fontSize: '16px',
                padding: '8px 0',
                fontWeight: 600,
              }}
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </section>

          {/* Amount Input */}
          <section className='tma-amount-card'>
            <div className='tma-input-head'>
              <CoinIcon height='16' width='16' />
              <span>Số tiền</span>
            </div>
            <label className='tma-amount-input'>
              <input
                className='font-mono'
                inputMode='numeric'
                placeholder='0'
                type='text'
                value={amountInput}
                onChange={(event) => {
                  setAmountInput(formatAmountInput(event.target.value))
                }}
              />
              <span>VND</span>
            </label>
          </section>

          {/* Date Picker */}
          <section className='tma-step-card'>
            <label className='tma-date-pill'>
              <CalendarIcon height='18' width='18' />
              <div>
                <span>Ngày chi tiêu</span>
                <strong>{formatDateLabel(dateString)}</strong>
              </div>
              <input
                type='date'
                value={dateString.slice(0, 10)}
                onChange={(event) => {
                  selection()

                  const nextDate = new Date(
                    `${event.target.value}T12:00:00+07:00`,
                  ).toISOString()
                  setDateString(nextDate)
                }}
              />
            </label>
          </section>

          {/* Category selection */}
          <section className='tma-section'>
            <div className='tma-section__header'>
              <p className='tma-section-label'>Danh mục</p>
            </div>
            <div
              className='tma-chip-grid'
              style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              {referenceCategories
                .filter((c) => c.kind === 'expense')
                .map((c) => {
                  const pres = getCategoryPresentation(
                    c.key,
                    referenceCategories,
                  )
                  const isActive = categoryKey === c.key

                  return (
                    <button
                      key={c.key}
                      className={`tma-select-chip ${isActive ? 'is-active' : ''}`}
                      type='button'
                      onClick={() => {
                        selection()
                        setCategoryKey(c.key)
                      }}>
                      <TmaMonogramBadge
                        accent={pres.accent}
                        label={pres.symbol}
                        size='sm'
                      />
                      <span>{pres.label}</span>
                    </button>
                  )
                })}
            </div>
          </section>

          {/* Source Selection */}
          <section className='tma-section'>
            <div className='tma-section__header'>
              <p className='tma-section-label'>Nguồn thanh toán</p>
            </div>
            <div
              className='tma-chip-grid'
              style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              {SOURCE_KEYS.map((key) => {
                const isActive = sourceKey === key

                return (
                  <button
                    key={key}
                    className={`tma-select-chip ${isActive ? 'is-active' : ''}`}
                    style={{ padding: '10px 4px', fontSize: '12px' }}
                    type='button'
                    onClick={() => {
                      selection()
                      setSourceKey(key)
                    }}>
                    <span>{getSourceLabel(key)}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Household Context */}
          <section className='tma-section'>
            <div className='tma-section__header'>
              <p className='tma-section-label'>Không gian gia đình</p>
            </div>
            <div
              className='tma-chip-grid'
              style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <button
                className={`tma-select-chip ${householdId === null ? 'is-active' : ''}`}
                type='button'
                onClick={() => {
                  selection()
                  setHouseholdId(null)
                }}>
                <span>Cá nhân</span>
              </button>
              {households.map((h) => {
                const isActive = householdId === h.id

                return (
                  <button
                    key={h.id}
                    className={`tma-select-chip ${isActive ? 'is-active' : ''}`}
                    type='button'
                    onClick={() => {
                      selection()
                      setHouseholdId(h.id)
                    }}>
                    <span>{h.name}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Note Input */}
          <section className='tma-note-card'>
            <div className='tma-input-head'>
              <NoteIcon height='16' width='16' />
              <span>Ghi chú</span>
            </div>
            <textarea
              placeholder='Nhập mô tả thêm...'
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </section>

          {/* Cancel button */}
          <div style={{ marginTop: '20px', display: 'grid' }}>
            <button
              className='tma-select-chip'
              style={{
                background: 'rgba(17, 24, 39, 0.05)',
                color: 'var(--tma-text-strong)',
                justifyContent: 'center',
                padding: '14px',
                borderRadius: '18px',
                fontWeight: 600,
              }}
              type='button'
              onClick={() => {
                selection()
                setIsEditing(false)
              }}>
              Hủy bỏ
            </button>
          </div>
        </div>
      ) : (
        // VIEW MODE
        <div className='tma-detail-view'>
          <TmaPageHeader
            eyebrow={category.label}
            subtitle={expense.title || category.label}
            title='Chi tiết chi tiêu'
          />

          <section
            className='tma-summary-card'
            style={{ marginBottom: '20px' }}>
            <div className='tma-summary-card__topline'>
              <div>
                <p className='tma-section-label'>Số tiền đã chi</p>
                <strong className='font-mono' style={{ fontSize: '32px' }}>
                  {formatCurrencyMinor(
                    expense.amountMinor,
                    expense.currencyCode,
                  )}
                </strong>
              </div>
              <TmaMonogramBadge
                accent={category.accent}
                label={category.symbol}
              />
            </div>

            {expense.note && (
              <div
                style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--tma-line)',
                }}>
                <p className='tma-section-label'>Mô tả</p>
                <p
                  style={{
                    color: 'var(--tma-text-strong)',
                    fontSize: '14px',
                    marginTop: '4px',
                  }}>
                  {expense.note}
                </p>
              </div>
            )}
          </section>

          {/* Info Card Grid */}
          <section className='tma-preview-card'>
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

          {/* Delete Confirm Alert Overlay (Minimalist in-page block) */}
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
                  Xác nhận xóa
                </p>
                <strong style={{ fontSize: '14px', fontWeight: 600 }}>
                  Bạn có chắc chắn muốn xóa khoản chi này? Thao tác này không
                  thể hoàn tác.
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
            // Normal View Mode Action Buttons
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
                  setIsEditing(true)
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
      )}
    </TmaPageShell>
  )
}
