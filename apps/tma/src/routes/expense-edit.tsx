import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Card, CardDescription } from '@/components/ui'
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
import { getExpenseDetailPath } from '@/lib/constants/routes'
import { formatAmountInput, parseAmountInput } from '@/lib/formatters'
import { hideBottomButton, setBottomButton } from '@/lib/telegram/bottom-button'
import { impact, notification } from '@/lib/telegram/haptics'
import { ExpenseEditForm } from '@/routes/expense-edit-form'

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
      <ExpenseEditForm
        activeCategory={activeCategory}
        amountInput={amountInput}
        currencyCode={expense?.currencyCode ?? 'VND'}
        draft={draft}
        expenseId={expenseId}
        groupPickerOptions={groupPickerOptions}
        householdPickerOptions={householdPickerOptions}
        isGroupLoading={personalGroupsQuery.isLoading}
        isHouseholdLoading={householdsQuery.isLoading}
        sourcePickerOptions={sourcePickerOptions}
        onAmountChange={handleAmountChange}
      />
    </TmaPageShell>
  )
}
