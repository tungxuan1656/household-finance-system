import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  CalendarIcon,
  ChevronRightIcon,
  CoinIcon,
  NoteIcon,
} from '@/components/shared/tma-icons'
import {
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  useExpenseDetailQuery,
  useUpdateExpenseMutation,
} from '@/features/expenses/api'
import { createEditExpenseDraft } from '@/features/expenses/draft'
import {
  buildHouseholdNameMap,
  getSourceLabel,
} from '@/features/expenses/presentation'
import { useEditExpenseStore } from '@/features/expenses/store'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { getCategoryPresentation } from '@/features/home/presentation'
import { SOURCE_KEYS } from '@/features/home/types'
import {
  formatAmountInput,
  formatDateLabel,
  parseAmountInput,
} from '@/lib/formatters'
import { hideBottomButton, setBottomButton } from '@/lib/telegram/bottom-button'
import { impact, notification, selection } from '@/lib/telegram/haptics'

// 1. MAIN EDIT FORM PAGE
export const ExpenseEditPage = () => {
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

  // Store
  const draft = useEditExpenseStore((state) => state.draft)
  const setDraft = useEditExpenseStore((state) => state.setDraft)
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)
  const resetStore = useEditExpenseStore((state) => state.reset)

  // Local state for formatted amount input
  const [amountInput, setAmountInput] = useState('')

  // Initialize draft if not present
  useEffect(() => {
    if (expense && !draft) {
      const editDraft = createEditExpenseDraft(expense)

      setDraft(editDraft)

      setAmountInput(formatAmountInput(String(Math.round(editDraft.amount))))
    }
  }, [expense, draft, setDraft])

  // Synchronize local amount changes into store
  const handleAmountChange = (val: string) => {
    const formatted = formatAmountInput(val)
    setAmountInput(formatted)
    updateDraft({ amount: parseAmountInput(formatted) })
  }

  // Map values
  const householdNameMap = useMemo(
    () => buildHouseholdNameMap(households),
    [households],
  )

  const activeCategory = getCategoryPresentation(
    draft?.categoryKey ?? expense?.categoryKey,
    referenceCategories,
  )

  const updateMutation = useUpdateExpenseMutation()

  const isValid = Boolean(
    draft && draft.title.trim().length > 0 && draft.amount > 0,
  )

  const handleSave = useEffectEvent(async () => {
    if (!isValid || !draft) return

    try {
      impact('medium')

      await updateMutation.mutateAsync({
        id: draft.id,
        payload: {
          title: draft.title.trim(),
          amount: draft.amount,
          note: draft.note.trim() || null,
          categoryKey: draft.categoryKey,
          sourceKey: draft.sourceKey,
          occurredAt: draft.occurredAt,
          householdId: draft.householdId,
        },
      })

      notification('success')
      resetStore()
      navigate(`/expenses/${draft.id}`, { replace: true })
    } catch {
      notification('error')
    }
  })

  // Telegram BottomButton coordination
  useEffect(() => {
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
  }, [isValid, updateMutation.isPending, handleSave])

  if (expenseQuery.isLoading || !draft) {
    return (
      <TmaPageShell showBackButton title='Sửa chi tiêu'>
        <div className='tma-empty-card'>
          <h2>Đang tải biểu mẫu...</h2>
          <p>Dữ liệu chỉnh sửa sẽ sẵn sàng ngay sau đây.</p>
        </div>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell
      reserveBottomButton
      showBackButton
      showBottomTabs={false}
      title='Sửa chi tiêu'>
      <div className='tma-edit-flow'>
        <TmaPageHeader
          eyebrow='CHẾ ĐỘ CHỈNH SỬA'
          subtitle='Thay đổi các thông tin và nhấn Lưu thay đổi.'
          title='Chỉnh sửa chi tiêu'
        />

        {/* Category + Date Summary Header Card */}
        <section
          className='tma-step-summary'
          style={{ padding: '12px 14px', marginBottom: '14px' }}>
          <TmaMonogramBadge
            accent={activeCategory.accent}
            label={activeCategory.symbol}
          />
          <div>
            <strong style={{ fontSize: '16px' }}>{activeCategory.label}</strong>
            <p>{formatDateLabel(new Date(draft.occurredAt).toISOString())}</p>
          </div>
        </section>

        {/* Title input */}
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
              padding: '6px 0',
              fontWeight: 600,
            }}
            type='text'
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
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
              onChange={(e) => handleAmountChange(e.target.value)}
            />
            <span>{expense?.currencyCode ?? 'VND'}</span>
          </label>
        </section>

        {/* Date Picker */}
        <section className='tma-step-card'>
          <label className='tma-date-pill'>
            <CalendarIcon height='18' width='18' />
            <div>
              <span>Ngày chi tiêu</span>
              <strong>
                {formatDateLabel(new Date(draft.occurredAt).toISOString())}
              </strong>
            </div>
            <input
              type='date'
              value={new Date(draft.occurredAt).toISOString().slice(0, 10)}
              onChange={(event) => {
                selection()

                const nextDate = new Date(
                  `${event.target.value}T12:00:00+07:00`,
                ).toISOString()
                updateDraft({ occurredAt: new Date(nextDate).getTime() })
              }}
            />
          </label>
        </section>

        {/* Clickable rows for Category, Payment Source, Household */}
        <section
          className='tma-list-card'
          style={{ display: 'grid', gap: '0', padding: '0 16px' }}>
          {/* Category row */}
          <div
            className='tma-settings-row'
            role='button'
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0',
              borderBottom: '1px solid var(--tma-line)',
              cursor: 'pointer',
            }}
            tabIndex={0}
            onClick={() => {
              selection()
              navigate(`/expenses/${expenseId}/edit/category`)
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TmaMonogramBadge
                accent={activeCategory.accent}
                label={activeCategory.symbol}
                size='sm'
              />
              <div>
                <p
                  className='tma-section-label'
                  style={{ fontSize: '11px', margin: 0 }}>
                  Danh mục
                </p>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '15px' }}>
                  {activeCategory.label}
                </h3>
              </div>
            </div>
            <ChevronRightIcon
              height='18'
              style={{ color: 'var(--tma-text-muted)' }}
              width='18'
            />
          </div>

          {/* Payment Source row */}
          <div
            className='tma-settings-row'
            role='button'
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0',
              borderBottom: '1px solid var(--tma-line)',
              cursor: 'pointer',
            }}
            tabIndex={0}
            onClick={() => {
              selection()
              navigate(`/expenses/${expenseId}/edit/source`)
            }}>
            <div>
              <p
                className='tma-section-label'
                style={{ fontSize: '11px', margin: 0 }}>
                Nguồn thanh toán
              </p>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '15px' }}>
                {getSourceLabel(draft.sourceKey)}
              </h3>
            </div>
            <ChevronRightIcon
              height='18'
              style={{ color: 'var(--tma-text-muted)' }}
              width='18'
            />
          </div>

          {/* Household space row */}
          <div
            className='tma-settings-row'
            role='button'
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0',
              cursor: 'pointer',
            }}
            tabIndex={0}
            onClick={() => {
              selection()
              navigate(`/expenses/${expenseId}/edit/household`)
            }}>
            <div>
              <p
                className='tma-section-label'
                style={{ fontSize: '11px', margin: 0 }}>
                Không gian gia đình
              </p>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '15px' }}>
                {draft.householdId
                  ? householdNameMap.get(draft.householdId) || 'Gia đình'
                  : 'Cá nhân (Không gắn)'}
              </h3>
            </div>
            <ChevronRightIcon
              height='18'
              style={{ color: 'var(--tma-text-muted)' }}
              width='18'
            />
          </div>
        </section>

        {/* Notes Input */}
        <section className='tma-note-card' style={{ marginTop: '14px' }}>
          <div className='tma-input-head'>
            <NoteIcon height='16' width='16' />
            <span>Ghi chú</span>
          </div>
          <textarea
            placeholder='Nhập mô tả thêm...'
            rows={4}
            value={draft.note}
            onChange={(e) => updateDraft({ note: e.target.value })}
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
              resetStore()
              navigate(-1)
            }}>
            Hủy bỏ
          </button>
        </div>
      </div>
    </TmaPageShell>
  )
}

// 2. CATEGORY SELECT SUB-PAGE
export const ExpenseEditCategoryPage = () => {
  const navigate = useNavigate()
  const categoriesQuery = useReferenceCategoriesQuery()
  const referenceCategories = categoriesQuery.data?.items ?? []

  const draft = useEditExpenseStore((state) => state.draft)
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)

  // Navigate back if refreshed and store is lost
  useEffect(() => {
    if (!draft) navigate('/expenses')
  }, [draft, navigate])

  if (!draft) return null

  return (
    <TmaPageShell showBackButton showBottomTabs={false} title='Chọn danh mục'>
      <TmaPageHeader
        eyebrow='DANH MỤC CHI TIÊU'
        subtitle='Chọn danh mục phù hợp nhất cho khoản chi.'
        title='Phân loại chi tiêu'
      />
      <div className='tma-category-grid'>
        {referenceCategories
          .filter((c) => c.kind === 'expense')
          .map((c) => {
            const pres = getCategoryPresentation(c.key, referenceCategories)
            const isActive = draft.categoryKey === c.key

            return (
              <button
                key={c.key}
                className={`tma-category-card ${isActive ? 'is-active' : ''}`}
                style={{
                  border: isActive ? '1px solid var(--tma-primary)' : undefined,
                  background: isActive ? 'rgba(63, 124, 255, 0.08)' : undefined,
                }}
                type='button'
                onClick={() => {
                  selection()
                  updateDraft({ categoryKey: c.key })
                  navigate(-1)
                }}>
                <TmaMonogramBadge accent={pres.accent} label={pres.symbol} />
                <span>{pres.label}</span>
              </button>
            )
          })}
      </div>
    </TmaPageShell>
  )
}

// 3. PAYMENT SOURCE SELECT SUB-PAGE
export const ExpenseEditSourcePage = () => {
  const navigate = useNavigate()
  const draft = useEditExpenseStore((state) => state.draft)
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)

  useEffect(() => {
    if (!draft) navigate('/expenses')
  }, [draft, navigate])

  if (!draft) return null

  return (
    <TmaPageShell showBackButton showBottomTabs={false} title='Chọn nguồn tiền'>
      <TmaPageHeader
        eyebrow='NGUỒN THANH TOÁN'
        subtitle='Chọn tài khoản hoặc ví dùng để chi.'
        title='Nguồn tiền thanh toán'
      />
      <section
        className='tma-list-card'
        style={{ display: 'grid', gap: '0', padding: '0 16px' }}>
        {SOURCE_KEYS.map((key, index) => {
          const isActive = draft.sourceKey === key

          return (
            <div
              key={key}
              role='button'
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom:
                  index < SOURCE_KEYS.length - 1
                    ? '1px solid var(--tma-line)'
                    : undefined,
                cursor: 'pointer',
                color: isActive
                  ? 'var(--tma-primary)'
                  : 'var(--tma-text-strong)',
                fontWeight: isActive ? 700 : 500,
              }}
              tabIndex={0}
              onClick={() => {
                selection()
                updateDraft({ sourceKey: key })
                navigate(-1)
              }}>
              <span>{getSourceLabel(key)}</span>
              {isActive && (
                <span className='tma-status-pill' style={{ margin: 0 }}>
                  Đang chọn
                </span>
              )}
            </div>
          )
        })}
      </section>
    </TmaPageShell>
  )
}

// 4. HOUSEHOLD SPACE SELECT SUB-PAGE
export const ExpenseEditHouseholdPage = () => {
  const navigate = useNavigate()
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []

  const draft = useEditExpenseStore((state) => state.draft)
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)

  useEffect(() => {
    if (!draft) navigate('/expenses')
  }, [draft, navigate])

  if (!draft) return null

  return (
    <TmaPageShell showBackButton showBottomTabs={false} title='Chọn không gian'>
      <TmaPageHeader
        eyebrow='KHÔNG GIAN GIA ĐÌNH'
        subtitle='Chọn gắn chi tiêu vào gia đình hoặc cá nhân.'
        title='Gắn bối cảnh chi tiêu'
      />
      <section
        className='tma-list-card'
        style={{ display: 'grid', gap: '0', padding: '0 16px' }}>
        {/* Personal Row Option */}
        <div
          role='button'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 0',
            borderBottom:
              households.length > 0 ? '1px solid var(--tma-line)' : undefined,
            cursor: 'pointer',
            color:
              draft.householdId === null
                ? 'var(--tma-primary)'
                : 'var(--tma-text-strong)',
            fontWeight: draft.householdId === null ? 700 : 500,
          }}
          tabIndex={0}
          onClick={() => {
            selection()
            updateDraft({ householdId: null })
            navigate(-1)
          }}>
          <span>Cá nhân (Không gắn)</span>
          {draft.householdId === null && (
            <span className='tma-status-pill' style={{ margin: 0 }}>
              Đang chọn
            </span>
          )}
        </div>

        {/* Households */}
        {households.map((h, index) => {
          const isActive = draft.householdId === h.id

          return (
            <div
              key={h.id}
              role='button'
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom:
                  index < households.length - 1
                    ? '1px solid var(--tma-line)'
                    : undefined,
                cursor: 'pointer',
                color: isActive
                  ? 'var(--tma-primary)'
                  : 'var(--tma-text-strong)',
                fontWeight: isActive ? 700 : 500,
              }}
              tabIndex={0}
              onClick={() => {
                selection()
                updateDraft({ householdId: h.id })
                navigate(-1)
              }}>
              <span>{h.name}</span>
              {isActive && (
                <span className='tma-status-pill' style={{ margin: 0 }}>
                  Đang chọn
                </span>
              )}
            </div>
          )
        })}
      </section>
    </TmaPageShell>
  )
}
