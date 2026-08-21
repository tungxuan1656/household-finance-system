import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useCreateExpenseMutation } from '@/features/expenses/api'
import { useAddExpenseFlowStore } from '@/features/expenses/model/store'
import { getSourceOptions } from '@/features/expenses/presentation'
import { useExpenseGroupAggregateQuery } from '@/features/groups/api'
import { getGroupContextLabel } from '@/features/groups/presentation'
import { useHouseholdsQuery } from '@/features/home/api'

import { useAddExpenseContextActions } from './use-add-expense-context-actions'

export const useAddExpenseContext = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const date = useAddExpenseFlowStore((state) => state.date)
  const category = useAddExpenseFlowStore((state) => state.category)
  const amount = useAddExpenseFlowStore((state) => state.amount)
  const title = useAddExpenseFlowStore((state) => state.title)
  const sourceId = useAddExpenseFlowStore((state) => state.sourceId)
  const householdId = useAddExpenseFlowStore((state) => state.householdId)
  const groupId = useAddExpenseFlowStore((state) => state.groupId)
  const setContext = useAddExpenseFlowStore((state) => state.setContext)
  const reset = useAddExpenseFlowStore((state) => state.reset)
  const householdsQuery = useHouseholdsQuery()
  const createExpenseMutation = useCreateExpenseMutation()
  const [feedback, setFeedback] = useState<string | null>(null)

  const households = useMemo(
    () => householdsQuery.data?.items ?? [],
    [householdsQuery.data?.items],
  )
  const groupsQuery = useExpenseGroupAggregateQuery(households)

  const groupItems = useMemo(() => {
    const items = groupsQuery.data?.items ?? []

    return [...items].sort((a, b) => b.createdAt - a.createdAt)
  }, [groupsQuery.data])

  const selectedSource =
    getSourceOptions(t).find((source) => source.id === sourceId) ?? null
  const selectedHousehold = households.find(
    (household) => household.id === householdId,
  )
  const selectedGroup = groupItems.find((g) => g.id === groupId) ?? null
  const selectedGroupHousehold = selectedGroup?.householdId
    ? (households.find((h) => h.id === selectedGroup.householdId) ?? null)
    : null
  const selectedGroupLabel = selectedGroup
    ? getGroupContextLabel(
        { group: selectedGroup, household: selectedGroupHousehold },
        t,
      )
    : null
  const isReady = category !== null && amount > 0 && sourceId !== null

  const householdPickerOptions = useMemo(
    () => [
      { value: '', label: t('expenses.add.contextPersonal') },
      ...households.map((h) => ({ value: h.id, label: h.name })),
    ],
    [households, t],
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

  const { handleSave } = useAddExpenseContextActions({
    t,
    navigate,
    amount,
    category,
    title,
    date,
    sourceId,
    householdId,
    groupId,
    createExpenseMutation,
    setFeedback,
    reset,
  })

  return {
    t,
    navigate,
    date,
    category,
    amount,
    title,
    sourceId,
    householdId,
    groupId,
    households,
    householdsQuery,
    groupsQuery,
    groupItems,
    createExpenseMutation,
    feedback,
    selectedSource,
    selectedHousehold,
    selectedGroup,
    selectedGroupLabel,
    isReady,
    householdPickerOptions,
    groupPickerOptions,
    setContext,
    handleSave,
  }
}
