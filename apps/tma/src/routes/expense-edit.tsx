import type { ReactNode } from 'react'
import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  ChevronRightIcon,
  CoinIcon,
  NoteIcon,
} from '@/components/shared/tma-icons'
import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  Eyebrow,
  Field,
  FieldLabel,
  Input,
  NativePicker,
} from '@/components/ui'
import { DatePicker } from '@/components/ui/date-picker'
import {
  useExpenseDetailQuery,
  useUpdateExpenseMutation,
} from '@/features/expenses/api'
import { createEditExpenseDraft } from '@/features/expenses/draft'
import { getSourceLabel } from '@/features/expenses/presentation'
import { useEditExpenseStore } from '@/features/expenses/store'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { getCategoryPresentation } from '@/features/home/presentation'
import { SOURCE_KEYS } from '@/features/home/types'
import {
  getExpenseDetailPath,
  getExpenseEditCategoryPath,
  getExpenseEditSourcePath,
  TMA_PATHS,
} from '@/lib/constants/routes'
import { formatAmountInput, parseAmountInput } from '@/lib/formatters'
import { hideBottomButton, setBottomButton } from '@/lib/telegram/bottom-button'
import { impact, notification, selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

const EditSelectRow = ({
  children,
  label,
  onClick,
  value,
}: {
  children?: ReactNode
  label: string
  onClick: () => void
  value: string
}) => (
  <div
    className='flex cursor-pointer items-center justify-between gap-3 border-b border-tma-line py-4 last:border-b-0'
    role='button'
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(event) => {
      if (event.key === 'Enter') onClick()
    }}>
    <div className='flex min-w-0 items-center gap-3'>
      {children}
      <div className='min-w-0'>
        <Eyebrow>{label}</Eyebrow>
        <h3 className='m-0 mt-0.5 truncate text-[15px] font-semibold text-tma-text-strong'>
          {value}
        </h3>
      </div>
    </div>
    <ChevronRightIcon
      className='shrink-0 text-tma-text-muted'
      height='18'
      width='18'
    />
  </div>
)

export const ExpenseEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const expenseId = id ?? 'unknown'
  const expenseQuery = useExpenseDetailQuery(expenseId, {
    enabled: expenseId !== 'unknown',
  })
  const categoriesQuery = useReferenceCategoriesQuery()
  const householdsQuery = useHouseholdsQuery()
  const expense = expenseQuery.data
  const referenceCategories = categoriesQuery.data?.items ?? []
  const households = householdsQuery.data?.items ?? []
  const draft = useEditExpenseStore((state) => state.draft)
  const setDraft = useEditExpenseStore((state) => state.setDraft)
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)
  const resetStore = useEditExpenseStore((state) => state.reset)
  const [amountInput, setAmountInput] = useState('')

  useEffect(() => {
    if (expense && !draft) {
      const editDraft = createEditExpenseDraft(expense)

      setDraft(editDraft)
      setAmountInput(formatAmountInput(String(Math.round(editDraft.amount))))
    }
  }, [expense, draft, setDraft])

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value)
    setAmountInput(formatted)
    updateDraft({ amount: parseAmountInput(formatted) })
  }

  const activeCategory = getCategoryPresentation(
    draft?.categoryKey ?? expense?.categoryKey,
    referenceCategories,
  )
  const updateMutation = useUpdateExpenseMutation()
  const isValid = Boolean(
    draft && draft.title.trim().length > 0 && draft.amount > 0,
  )

  const householdPickerOptions = useMemo(
    () => [
      { value: '', label: 'Cá nhân (Không gắn)' },
      ...households.map((h) => ({ value: h.id, label: h.name })),
    ],
    [households],
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
          categoryKey: draft.categoryKey,
          sourceKey: draft.sourceKey,
          occurredAt: draft.occurredAt,
          householdId: draft.householdId,
        },
      })

      notification('success')
      resetStore()
      navigate(getExpenseDetailPath(draft.id), { replace: true })
    } catch {
      notification('error')
    }
  })

  useEffect(() => {
    const cleanup = setBottomButton({
      text: 'Lưu thay đổi',
      enabled: isValid && !updateMutation.isPending,
      showProgress: updateMutation.isPending,
      onClick: () => {
        void handleSave()
      },
    })

    return () => {
      cleanup()
      hideBottomButton()
    }
  }, [isValid, updateMutation.isPending])

  if (expenseQuery.isLoading || !draft) {
    return (
      <TmaPageShell title='Sửa chi tiêu'>
        <Card>
          <CardDescription>Đang tải biểu mẫu...</CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell reserveBottomButton title='Sửa chi tiêu'>
      <Card className='mt-3 grid gap-3'>
        <div className='inline-flex items-center gap-2 text-xs font-bold text-tma-text-muted'>
          <NoteIcon height='16' width='16' />
          <span>Tên *</span>
        </div>
        <Input
          className='border-0 bg-transparent px-0 text-base font-semibold'
          placeholder='Nhập tên khoản chi tiêu...'
          value={draft.title}
          onChange={(event) => updateDraft({ title: event.target.value })}
        />
      </Card>

      <Card className='mt-3 grid gap-3'>
        <div className='inline-flex items-center gap-2 text-xs font-bold text-tma-text-muted'>
          <CoinIcon height='16' width='16' />
          <span>Số tiền</span>
        </div>
        <label className='flex items-end justify-between gap-2 rounded-[20px] bg-black/[0.04] p-4'>
          <input
            className='w-full bg-transparent font-mono text-[34px] leading-none font-extrabold text-tma-text-strong outline-none'
            inputMode='numeric'
            placeholder='0'
            type='text'
            value={amountInput}
            onChange={(event) => handleAmountChange(event.target.value)}
          />
          <span className='text-xs font-semibold text-tma-text-muted'>
            {expense?.currencyCode ?? 'VND'}
          </span>
        </label>
      </Card>

      <Card className='mt-3 overflow-hidden p-0'>
        <DatePicker
          fullWidth
          aria-label='Ngày chi tiêu'
          value={new Date(draft.occurredAt).toISOString().slice(0, 10)}
          onChange={(value) => {
            selection()

            const nextDate = new Date(`${value}T12:00:00+07:00`).toISOString()
            updateDraft({ occurredAt: new Date(nextDate).getTime() })
          }}
        />
      </Card>

      <Card className='mt-3 grid gap-0 px-4'>
        <EditSelectRow
          label='Danh mục'
          value={activeCategory.label}
          onClick={() => {
            selection()
            navigate(getExpenseEditCategoryPath(expenseId))
          }}>
          <TmaCategoryIconBadge
            accent={activeCategory.accent}
            iconUrl={activeCategory.iconUrl}
            size='sm'
            symbol={activeCategory.symbol}
          />
        </EditSelectRow>
        <EditSelectRow
          label='Nguồn thanh toán'
          value={getSourceLabel(draft.sourceKey)}
          onClick={() => {
            selection()
            navigate(getExpenseEditSourcePath(expenseId))
          }}
        />
      </Card>

      <Card className='mt-3 grid gap-3'>
        <Field>
          <FieldLabel>Không gian gia đình</FieldLabel>
          <NativePicker
            fullWidth
            aria-label='Chọn không gian gia đình'
            disabled={householdsQuery.isLoading}
            options={householdPickerOptions}
            value={draft.householdId ?? ''}
            onChange={(next) => {
              selection()
              updateDraft({ householdId: next || null })
            }}
          />
        </Field>
      </Card>

      <div className='mt-5 grid'>
        <Button
          variant='ghost'
          onClick={() => {
            selection()
            resetStore()
            navigate(-1)
          }}>
          Hủy bỏ
        </Button>
      </div>
    </TmaPageShell>
  )
}

export const ExpenseEditCategoryPage = () => {
  const navigate = useNavigate()
  const categoriesQuery = useReferenceCategoriesQuery()
  const referenceCategories = categoriesQuery.data?.items ?? []
  const draft = useEditExpenseStore((state) => state.draft)
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)

  useEffect(() => {
    if (!draft) navigate(TMA_PATHS.expenses)
  }, [draft, navigate])

  if (!draft) return null

  return (
    <TmaPageShell title='Chọn danh mục'>
      <div className='grid grid-cols-2 gap-2.5'>
        {referenceCategories
          .filter((category) => category.kind === 'expense')
          .map((category) => {
            const presentation = getCategoryPresentation(
              category.key,
              referenceCategories,
            )
            const isActive = draft.categoryKey === category.key

            return (
              <button
                key={category.key}
                className={cn(
                  'grid min-h-28 content-start gap-3 rounded-[20px] border border-black/[0.04] bg-white p-3.5 text-left shadow-tma-soft transition active:scale-[0.98]',
                  isActive && 'border-tma-primary bg-tma-primary/10',
                )}
                type='button'
                onClick={() => {
                  selection()
                  updateDraft({ categoryKey: category.key })
                  navigate(-1)
                }}>
                <TmaCategoryIconBadge
                  accent={presentation.accent}
                  iconUrl={presentation.iconUrl}
                  symbol={presentation.symbol}
                />
                <span className='text-[15px] font-semibold text-tma-text-strong'>
                  {presentation.label}
                </span>
              </button>
            )
          })}
      </div>
    </TmaPageShell>
  )
}

export const ExpenseEditSourcePage = () => {
  const navigate = useNavigate()
  const draft = useEditExpenseStore((state) => state.draft)
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)

  useEffect(() => {
    if (!draft) navigate(TMA_PATHS.expenses)
  }, [draft, navigate])

  if (!draft) return null

  return (
    <TmaPageShell title='Chọn nguồn tiền'>
      <Card className='grid gap-0 px-4'>
        {SOURCE_KEYS.map((key, index) => {
          const isActive = draft.sourceKey === key

          return (
            <div
              key={key}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-3 py-4',
                index < SOURCE_KEYS.length - 1 && 'border-b border-tma-line',
                isActive
                  ? 'font-bold text-tma-primary'
                  : 'font-medium text-tma-text-strong',
              )}
              role='button'
              tabIndex={0}
              onClick={() => {
                selection()
                updateDraft({ sourceKey: key })
                navigate(-1)
              }}>
              <span>{getSourceLabel(key)}</span>
            </div>
          )
        })}
      </Card>
    </TmaPageShell>
  )
}
