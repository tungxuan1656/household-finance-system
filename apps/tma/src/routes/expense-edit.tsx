import type { ReactNode } from 'react'
import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  ChipButton,
  DataState,
  Eyebrow,
  Field,
  FieldLabel,
  Input,
  NativePicker,
  Section,
  SectionHeader,
} from '@/components/ui'
import { DatePicker } from '@/components/ui/date-picker'
import {
  useExpenseDetailQuery,
  useUpdateExpenseMutation,
} from '@/features/expenses/api'
import { createEditExpenseDraft } from '@/features/expenses/draft'
import { getSourceOptions } from '@/features/expenses/presentation'
import { useEditExpenseStore } from '@/features/expenses/store'
import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '@/features/groups/api'
import type { GroupListItem } from '@/features/groups/types'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { getCategoryPresentation } from '@/features/home/presentation'
import type { SourceKey } from '@/features/home/types'
import {
  getExpenseDetailPath,
  getExpenseEditCategoryPath,
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
  const { t } = useTranslation()
  const expenseId = id ?? 'unknown'
  const expenseQuery = useExpenseDetailQuery(expenseId, {
    enabled: expenseId !== 'unknown',
  })
  const categoriesQuery = useReferenceCategoriesQuery()
  const householdsQuery = useHouseholdsQuery()
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
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

      setAmountInput(
        formatAmountInput(String(Math.round(editDraft.amount / 1000))),
      )
    }
  }, [expense, draft, setDraft])

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value)
    setAmountInput(formatted)
    updateDraft({ amount: parseAmountInput(formatted) * 1000 })
  }

  const activeCategory = getCategoryPresentation(
    draft?.categoryKey ?? expense?.categoryKey,
    t,
    referenceCategories,
  )
  const updateMutation = useUpdateExpenseMutation()
  const isValid = Boolean(
    draft && draft.title.trim().length > 0 && draft.amount > 0,
  )

  const householdGroupQueries = useHouseholdExpenseGroupQueries(households)

  const groupItems = useMemo<GroupListItem[]>(() => {
    const personalGroups = personalGroupsQuery.data?.items ?? []

    return [
      ...personalGroups.map((group) => ({ group, household: null })),
      ...households.flatMap((household, index) => {
        const query = householdGroupQueries[index]
        const groups = query?.data?.items ?? []

        return groups.map((group) => ({ group, household }))
      }),
    ].sort((left, right) => right.group.createdAt - left.group.createdAt)
  }, [householdGroupQueries, households, personalGroupsQuery.data?.items])

  const householdPickerOptions = useMemo(
    () => [
      { value: '', label: t('expenses.edit.optionPersonal') },
      ...households.map((h) => ({ value: h.id, label: h.name })),
    ],
    [households, t],
  )

  const sourcePickerOptions = useMemo(
    () => getSourceOptions(t).map((s) => ({ value: s.id, label: s.label })),
    [t],
  )

  const groupPickerOptions = useMemo(
    () => [
      { value: '', label: t('expenses.edit.optionUngrouped') },
      ...groupItems.map((item) => ({
        value: item.group.id,
        label: item.group.name,
      })),
    ],
    [groupItems, t],
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
          ...(draft.groupId ? { groupIds: [draft.groupId] } : {}),
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
      text: t('expenses.edit.save'),
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
      <TmaPageShell title={t('expenses.edit.title')}>
        <Card>
          <CardDescription>{t('expenses.edit.loading')}</CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell reserveBottomButton title={t('expenses.edit.title')}>
      {/* Money input */}
      <Card className='mt-3 grid gap-3'>
        <div className='inline-flex items-center gap-2 text-xs font-bold text-tma-text-muted'>
          <CoinIcon height='16' width='16' />
          <span>{t('expenses.edit.fieldAmount')}</span>
        </div>
        <label className='flex items-end justify-between gap-2 rounded-3xl bg-white p-4'>
          <input
            className='w-full bg-transparent text-right font-mono text-3xl leading-none font-semibold text-tma-text-strong outline-none'
            inputMode='numeric'
            placeholder='0'
            type='text'
            value={amountInput}
            onChange={(event) => handleAmountChange(event.target.value)}
          />
          <span className='font-mono text-3xl font-semibold text-tma-text-strong/80'>
            .000
          </span>
          <span className='text-xs font-semibold text-tma-text-muted'>
            {expense?.currencyCode ?? 'VND'}
          </span>
        </label>
      </Card>

      {/* Title */}
      <Card className='mt-3 grid gap-3'>
        <div className='inline-flex items-center gap-2 text-xs font-bold text-tma-text-muted'>
          <NoteIcon height='16' width='16' />
          <span>{t('expenses.edit.fieldName')}</span>
        </div>
        <Input
          className='border-0 bg-transparent px-0 text-base font-semibold'
          placeholder={t('expenses.edit.fieldNamePlaceholder')}
          value={draft.title}
          onChange={(event) => updateDraft({ title: event.target.value })}
        />
      </Card>

      {/* Date */}
      <Card className='mt-3 overflow-hidden p-0'>
        <DatePicker
          fullWidth
          aria-label={t('expenses.edit.fieldDate')}
          value={new Date(draft.occurredAt).toISOString().slice(0, 10)}
          onChange={(value) => {
            selection()

            const nextDate = new Date(`${value}T12:00:00+07:00`).toISOString()
            updateDraft({ occurredAt: new Date(nextDate).getTime() })
          }}
        />
      </Card>

      {/* Category */}
      <Card className='mt-3 grid gap-0 px-4'>
        <EditSelectRow
          label={t('expenses.edit.fieldCategory')}
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
      </Card>

      {/* Source */}
      <Card className='mt-3 grid gap-3'>
        <Field>
          <FieldLabel>{t('expenses.edit.fieldSource')}</FieldLabel>
          <NativePicker
            fullWidth
            aria-label={t('expenses.edit.fieldSourcePlaceholder')}
            options={sourcePickerOptions}
            value={draft.sourceKey}
            onChange={(next) => {
              selection()
              updateDraft({ sourceKey: next as SourceKey })
            }}
          />
        </Field>
      </Card>

      {/* Household */}
      <Card className='mt-3 grid gap-3'>
        <Field>
          <FieldLabel>{t('expenses.edit.fieldHousehold')}</FieldLabel>
          <NativePicker
            fullWidth
            aria-label={t('expenses.edit.fieldHouseholdPlaceholder')}
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

      {/* Group */}
      <Card className='mt-3 grid gap-3'>
        <Field>
          <FieldLabel>{t('expenses.edit.fieldGroup')}</FieldLabel>
          <NativePicker
            fullWidth
            aria-label={t('expenses.edit.fieldGroupPlaceholder')}
            disabled={personalGroupsQuery.isLoading}
            options={groupPickerOptions}
            value={draft.groupId ?? ''}
            onChange={(next) => {
              selection()
              updateDraft({ groupId: next || null })
            }}
          />
        </Field>
      </Card>

      {/* Cancel */}
      <div className='mt-5 grid'>
        <Button
          variant='ghost'
          onClick={() => {
            selection()
            resetStore()
            navigate(-1)
          }}>
          {t('common.cancel')}
        </Button>
      </div>
    </TmaPageShell>
  )
}

export const ExpenseEditCategoryPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const categoriesQuery = useReferenceCategoriesQuery()
  const referenceCategories = categoriesQuery.data?.items ?? []
  const draft = useEditExpenseStore((state) => state.draft)
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)

  const categoryOptions = referenceCategories
    .filter((category) => category.kind === 'expense')
    .map((category) => ({
      id: category.key,
      ...getCategoryPresentation(category.key, t, referenceCategories),
    }))

  useEffect(() => {
    if (!draft) navigate(TMA_PATHS.expenses)
  }, [draft, navigate])

  if (!draft) return null

  return (
    <TmaPageShell title={t('expenses.edit.categoryPicker')}>
      <Section>
        <SectionHeader title={t('expenses.edit.sectionCategory')} />
        <DataState
          emptyDescription={t('expenses.edit.emptyDescription')}
          emptyTitle={t('expenses.edit.emptyTitle')}
          errorDescription={t('expenses.edit.loadErrorDesc')}
          errorTitle={t('expenses.edit.loadError')}
          isEmpty={
            !categoriesQuery.isLoading &&
            !categoriesQuery.isError &&
            categoryOptions.length === 0
          }
          isError={categoriesQuery.isError && categoryOptions.length === 0}
          isLoading={categoriesQuery.isLoading && categoryOptions.length === 0}
          loadingDescription={t('expenses.edit.loadErrorDesc')}
          loadingTitle={t('expenses.edit.loadingCategory')}
          retryAction={categoriesQuery.refetch}>
          <div className='grid grid-cols-3 gap-2'>
            {categoryOptions.map((category) => {
              const isActive = draft.categoryKey === category.id

              return (
                <ChipButton
                  key={category.id}
                  aria-pressed={isActive}
                  className={cn(
                    'grid min-h-20 content-start',
                    isActive && 'ring-2 ring-tma-primary',
                  )}
                  onClick={() => {
                    selection()
                    updateDraft({ categoryKey: category.id })
                    navigate(-1)
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
              )
            })}
          </div>
        </DataState>
      </Section>
    </TmaPageShell>
  )
}
