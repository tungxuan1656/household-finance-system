import { useEffectEvent } from 'react'
import type { NavigateFunction } from 'react-router-dom'

import type { CategoryKey, SourceKey } from '@/features/home/types'
import { TMA_PATHS } from '@/lib/constants/routes'
import { notification } from '@/lib/telegram/haptics'

import type { CreateExpenseRequest } from '../api'

export const useAddExpenseContextActions = ({
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
}: {
  t: (key: string, options?: Record<string, unknown>) => string
  navigate: NavigateFunction
  amount: number
  category: { id: CategoryKey } | null
  title: string
  date: string
  sourceId: SourceKey | null
  householdId: string | null
  groupId: string | null
  createExpenseMutation: {
    mutateAsync: (data: CreateExpenseRequest) => Promise<unknown>
  }
  setFeedback: (value: string | null) => void
  reset: () => void
}) => {
  const handleSave = useEffectEvent(async () => {
    if (!category || amount <= 0 || !sourceId) {
      return
    }

    try {
      setFeedback(null)

      await createExpenseMutation.mutateAsync({
        amount,
        categoryKey: category.id,
        sourceKey: sourceId,
        title: title.trim(),
        occurredAt: new Date(date).getTime(),
        ...(householdId ? { householdId } : {}),
        ...(groupId ? { groupIds: [groupId] } : {}),
      })

      notification('success')
      reset()
      // Pop the 3 add-flow steps from history, then replace the origin with
      // home so back from the landing screen does not reopen the form.
      navigate(-3)
      navigate(TMA_PATHS.root, { replace: true })
    } catch (error) {
      notification('error')

      setFeedback(
        error instanceof Error ? error.message : t('expenses.add.saveError'),
      )
    }
  })

  return { handleSave }
}
