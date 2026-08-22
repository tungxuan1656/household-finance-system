import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageFooter, TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  useExpenseDetailQuery,
  useUpdateExpenseMutation,
} from '@/features/expenses/api'
import { createEditExpenseDraft } from '@/features/expenses/model/draft'
import { useEditExpenseStore } from '@/features/expenses/model/store'
import { getSourceOptions } from '@/features/expenses/presentation'
import { useExpenseGroupAggregateQuery } from '@/features/groups/api'
import { useHouseholdsQuery } from '@/features/home/api'
import { useCategoryPresentation } from '@/features/home/presentation'
import {
  getExpenseDetailPath,
  isExpenseEditFlowPathname,
} from '@/lib/constants/routes'
import {
  formatAmountInput,
  minorFromRaw,
  parseAmountInput,
} from '@/lib/formatters'
import { notification } from '@/lib/telegram/haptics'

import { ExpenseEditForm } from '../components/expense-edit-form'

export const ExpenseEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const expenseId = id ?? 'unknown'
  const expenseQuery = useExpenseDetailQuery(expenseId, {
    enabled: expenseId !== 'unknown',
  })
  const householdsQuery = useHouseholdsQuery()
  const expense = expenseQuery.data
  const households = useMemo(
    () => householdsQuery.data?.items ?? [],
    [householdsQuery.data?.items],
  )
  const groupsQuery = useExpenseGroupAggregateQuery(households)
  const draft = useEditExpenseStore((state) => state.draft)
  const setDraft = useEditExpenseStore((state) => state.setDraft)
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)
  const resetStore = useEditExpenseStore((state) => state.reset)
  const [amountInput, setAmountInput] = useState(() =>
    draft ? formatAmountInput(String(draft.amount)) : '',
  )

  useEffect(() => {
    if (!expense) return

    if (!draft || draft.id !== expense.id) {
      const editDraft = createEditExpenseDraft(expense)

      setDraft(editDraft)

      setAmountInput(formatAmountInput(String(editDraft.amount)))
    } else if (amountInput === '') {
      setAmountInput(formatAmountInput(String(draft.amount)))
    }
  }, [expense, draft, setDraft, amountInput])

  // Reset edit draft store when leaving the page so a fresh visit hydrates
  // the amount input from the expense instead of reusing a stale draft.
  // ── IMPORTANT ─────────────────────────────────────────────────────────
  // /expenses/:id/edit and /expenses/:id/edit/category are sibling routes.
  // Navigating to the category page unmounts this component.  We must NOT
  // clear the draft in that case or the category page sees `!draft` and
  // redirects away (breaking the BackButton as well).
  useEffect(() => {
    return () => {
      if (!isExpenseEditFlowPathname(location.pathname, id)) {
        resetStore()
      }
    }
  }, [resetStore, id, location.pathname])

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value)
    setAmountInput(formatted)
    updateDraft({ amount: parseAmountInput(formatted) })
  }

  const activeCategory = useCategoryPresentation(
    draft?.categoryKey ?? expense?.categoryKey,
  )
  const updateMutation = useUpdateExpenseMutation()
  const isValid = Boolean(
    draft && draft.title.trim().length > 0 && draft.amount > 0,
  )

  const groupItems = useMemo(
    () => groupsQuery.data?.items ?? [],
    [groupsQuery.data],
  )

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
        value: item.id,
        label: item.name,
      })),
    ],
    [groupItems, t],
  )

  const handleSave = useEffectEvent(async () => {
    if (!isValid || !draft) return

    try {
      await updateMutation.mutateAsync({
        id: draft.id,
        payload: {
          title: draft.title.trim(),
          amount: minorFromRaw(draft.amount),
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

  return (
    <TmaPageShell
      contentClassName='gap-4'
      footer={
        <TmaPageFooter>
          <TmaHapticButton
            variant='ghost'
            onClick={() => {
              resetStore()
              navigate(-1)
            }}>
            {t('common.cancel')}
          </TmaHapticButton>
          <TmaHapticButton
            aria-busy={updateMutation.isPending}
            disabled={!isValid || updateMutation.isPending}
            onClick={() => {
              void handleSave()
            }}>
            {updateMutation.isPending
              ? t('expenses.add.saving')
              : t('expenses.edit.save')}
          </TmaHapticButton>
        </TmaPageFooter>
      }
      title={t('expenses.edit.title')}>
      <QueryState
        error={{
          description: t('dataState.errorDescription'),
          title: t('dataState.errorTitle'),
        }}
        pending={{
          description: '',
          title: t('expenses.edit.loading'),
        }}
        query={expenseQuery}
        variant='card'>
        {() => {
          if (!draft) return null

          return (
            <ExpenseEditForm
              activeCategory={activeCategory}
              amountInput={amountInput}
              currencyCode={expense?.currencyCode ?? 'VND'}
              draft={draft}
              expenseId={expenseId}
              groupPickerOptions={groupPickerOptions}
              householdPickerOptions={householdPickerOptions}
              sourcePickerOptions={sourcePickerOptions}
              onAmountChange={handleAmountChange}
            />
          )
        }}
      </QueryState>
    </TmaPageShell>
  )
}
