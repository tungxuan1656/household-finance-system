import type { ReactNode } from 'react'
import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  CalendarIcon,
  ChevronRightIcon,
  CoinIcon,
  NoteIcon,
} from '@/components/shared/tma-icons'
import {
  TmaCategoryIconBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Chip,
  Eyebrow,
  Input,
} from '@/components/ui'
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
  getExpenseDetailPath,
  getExpenseEditCategoryPath,
  getExpenseEditHouseholdPath,
  getExpenseEditSourcePath,
  TMA_PATHS,
} from '@/lib/constants/routes'
import {
  formatAmountInput,
  formatDateLabel,
  parseAmountInput,
} from '@/lib/formatters'
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
          <CardTitle>Đang tải biểu mẫu...</CardTitle>
          <CardDescription>
            Dữ liệu chỉnh sửa sẽ sẵn sàng ngay sau đây.
          </CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell reserveBottomButton title='Sửa chi tiêu'>
      <TmaPageHeader
        eyebrow='Chế độ chỉnh sửa'
        subtitle='Thay đổi các thông tin và nhấn Lưu thay đổi.'
        title='Chỉnh sửa chi tiêu'
      />

      <Card className='mb-3 flex items-center gap-3 p-3.5'>
        <TmaCategoryIconBadge
          accent={activeCategory.accent}
          iconUrl={activeCategory.iconUrl}
          symbol={activeCategory.symbol}
        />
        <div>
          <strong className='text-base text-tma-text-strong'>
            {activeCategory.label}
          </strong>
          <CardDescription>
            {formatDateLabel(new Date(draft.occurredAt).toISOString())}
          </CardDescription>
        </div>
      </Card>

      <Card className='grid gap-3'>
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

      <Card className='mt-3'>
        <label className='relative flex items-center gap-3 overflow-hidden rounded-[18px] bg-black/[0.04] p-3.5'>
          <CalendarIcon
            className='text-tma-text-muted'
            height='18'
            width='18'
          />
          <div className='grid gap-1'>
            <span className='text-xs text-tma-text-muted'>Ngày chi tiêu</span>
            <strong className='text-tma-text-strong'>
              {formatDateLabel(new Date(draft.occurredAt).toISOString())}
            </strong>
          </div>
          <input
            className='absolute inset-0 opacity-0'
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
        <EditSelectRow
          label='Không gian gia đình'
          value={
            draft.householdId
              ? householdNameMap.get(draft.householdId) || 'Gia đình'
              : 'Cá nhân (Không gắn)'
          }
          onClick={() => {
            selection()
            navigate(getExpenseEditHouseholdPath(expenseId))
          }}
        />
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
      <TmaPageHeader
        eyebrow='Danh mục chi tiêu'
        subtitle='Chọn danh mục phù hợp nhất cho khoản chi.'
        title='Phân loại chi tiêu'
      />
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
      <TmaPageHeader
        eyebrow='Nguồn thanh toán'
        subtitle='Chọn tài khoản hoặc ví dùng để chi.'
        title='Nguồn tiền thanh toán'
      />
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
              {isActive ? <Chip tone='primary'>Đang chọn</Chip> : null}
            </div>
          )
        })}
      </Card>
    </TmaPageShell>
  )
}

export const ExpenseEditHouseholdPage = () => {
  const navigate = useNavigate()
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []
  const draft = useEditExpenseStore((state) => state.draft)
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)

  useEffect(() => {
    if (!draft) navigate(TMA_PATHS.expenses)
  }, [draft, navigate])

  if (!draft) return null

  return (
    <TmaPageShell title='Chọn không gian'>
      <TmaPageHeader
        eyebrow='Không gian gia đình'
        subtitle='Chọn gắn chi tiêu vào gia đình hoặc cá nhân.'
        title='Gắn bối cảnh chi tiêu'
      />
      <Card className='grid gap-0 px-4'>
        <div
          className={cn(
            'flex cursor-pointer items-center justify-between gap-3 py-4',
            households.length > 0 && 'border-b border-tma-line',
            draft.householdId === null
              ? 'font-bold text-tma-primary'
              : 'font-medium text-tma-text-strong',
          )}
          role='button'
          tabIndex={0}
          onClick={() => {
            selection()
            updateDraft({ householdId: null })
            navigate(-1)
          }}>
          <span>Cá nhân (Không gắn)</span>
          {draft.householdId === null ? (
            <Chip tone='primary'>Đang chọn</Chip>
          ) : null}
        </div>

        {households.map((household, index) => {
          const isActive = draft.householdId === household.id

          return (
            <div
              key={household.id}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-3 py-4',
                index < households.length - 1 && 'border-b border-tma-line',
                isActive
                  ? 'font-bold text-tma-primary'
                  : 'font-medium text-tma-text-strong',
              )}
              role='button'
              tabIndex={0}
              onClick={() => {
                selection()
                updateDraft({ householdId: household.id })
                navigate(-1)
              }}>
              <span>{household.name}</span>
              {isActive ? <Chip tone='primary'>Đang chọn</Chip> : null}
            </div>
          )
        })}
      </Card>
    </TmaPageShell>
  )
}
