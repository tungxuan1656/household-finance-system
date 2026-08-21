import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store'
import { useHouseholdsQuery } from '@/features/home/api'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatAmountInput } from '@/lib/formatters'
import { impact } from '@/lib/telegram/haptics'

import {
  useBudgetDetailQuery,
  useBudgetStatusQuery,
  useDeleteBudgetMutation,
  useUpdateBudgetMutation,
} from '../api'
import {
  type BudgetMutationFormValues,
  buildBudgetMutationRequest,
  parseBudgetAmountInputToMinor,
} from '../presentation'
import type { BudgetFeedback } from '../types'

export const useBudgetDetail = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const currentUserId = useAuthStore((state) => state.user?.id ?? null)

  const detailQuery = useBudgetDetailQuery(id ?? '')
  const statusQuery = useBudgetStatusQuery(id ?? '')
  const householdsQuery = useHouseholdsQuery()
  const updateMutation = useUpdateBudgetMutation()
  const deleteMutation = useDeleteBudgetMutation()

  const budget = detailQuery.data
  const status = statusQuery.data
  const households = householdsQuery.data?.items ?? []
  const household = useMemo(
    () => households.find((entry) => entry.id === budget?.householdId) ?? null,
    [households, budget?.householdId],
  )

  const [feedback, setFeedback] = useState<BudgetFeedback | null>(
    () =>
      (location.state as { feedback?: BudgetFeedback } | null)?.feedback ??
      null,
  )
  const [isEditing, setIsEditing] = useState(false)
  const [totalLimitInput, setTotalLimitInput] = useState(
    formatAmountInput(String(budget?.totalLimitMinor ?? 0)),
  )

  useEffect(() => {
    if (isEditing) return
    setTotalLimitInput(formatAmountInput(String(budget?.totalLimitMinor ?? 0)))
  }, [budget?.totalLimitMinor, isEditing])

  const canEdit = useMemo(() => {
    if (!budget) return false
    if (budget.scope === 'household') {
      return budget.createdByUserId === currentUserId
    }
    if (budget.scope === 'personal') {
      return budget.ownerUserId === currentUserId
    }

    return false
  }, [budget, currentUserId])

  const handleRefresh = async () => {
    await Promise.all([
      detailQuery.refetch(),
      statusQuery.refetch(),
      householdsQuery.refetch(),
    ])
  }

  const handleUpdate = async (values: BudgetMutationFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: budget!.id,
        payload: buildBudgetMutationRequest(values),
      })

      impact('light')
      setFeedback({ message: t('budgets.detail.updated'), tone: 'success' })
      setIsEditing(false)
      await statusQuery.refetch()
    } catch {
      setFeedback({ message: t('budgets.detail.updateError'), tone: 'error' })
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(t('budgets.detail.deleteConfirm'))
    if (!confirmed) return
    try {
      await deleteMutation.mutateAsync(budget!.id)
      impact('medium')

      navigate(TMA_PATHS.budgets, {
        replace: true,
        state: {
          feedback: { message: t('budgets.detail.deleted'), tone: 'success' },
        },
      })
    } catch {
      setFeedback({ message: t('budgets.detail.deleteError'), tone: 'error' })
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const totalLimitMinor = parseBudgetAmountInputToMinor(totalLimitInput)
    if (!totalLimitMinor || totalLimitMinor <= 0) return

    void handleUpdate({
      mode: 'edit',
      period: budget!.period,
      scope: budget!.scope,
      totalLimitMinor,
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (budget) {
      setTotalLimitInput(formatAmountInput(String(budget.totalLimitMinor)))
    }
  }

  return {
    id,
    t,
    detailQuery,
    statusQuery,
    householdsQuery,
    updateMutation,
    deleteMutation,
    budget,
    status,
    households,
    household,
    feedback,
    isEditing,
    setIsEditing,
    totalLimitInput,
    setTotalLimitInput,
    canEdit,
    handleRefresh,
    handleDelete,
    handleSubmit,
    handleCancelEdit,
  }
}
