import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useHouseholdsQuery } from '@/features/home/api'

import { useBudgetListQuery } from '../api'

type ScopeFilter = 'all' | 'household' | 'personal'

export const useBudgetList = () => {
  const { t } = useTranslation()
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []

  const adminHouseholds = useMemo(
    () => households.filter((h) => h.role === 'admin'),
    [households],
  )

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all')
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('')

  const scopeFilterOptions = useMemo(
    () => [
      { label: t('budgets.filterAll'), value: 'all' as const },
      { label: t('budgets.householdLabel'), value: 'household' as const },
      { label: t('budgets.filterPersonal'), value: 'personal' as const },
    ],
    [t],
  )

  const listParams = useMemo(() => {
    if (scopeFilter === 'personal') return { scope: 'personal' as const }
    if (scopeFilter === 'household') {
      return {
        scope: 'household' as const,
        householdId: selectedHouseholdId || undefined,
      }
    }

    return {}
  }, [scopeFilter, selectedHouseholdId])

  const budgetsQuery = useBudgetListQuery(listParams)

  const canCreateBudget =
    scopeFilter === 'personal' ||
    scopeFilter === 'all' ||
    adminHouseholds.length > 0

  useEffect(() => {
    if (!selectedHouseholdId && adminHouseholds[0]) {
      setSelectedHouseholdId(adminHouseholds[0].id)
    }
  }, [adminHouseholds, selectedHouseholdId])

  const retryBoth = async () => {
    await Promise.all([householdsQuery.refetch(), budgetsQuery.refetch()])
  }

  return {
    t,
    householdsQuery,
    households,
    scopeFilter,
    setScopeFilter,
    selectedHouseholdId,
    setSelectedHouseholdId,
    scopeFilterOptions,
    budgetsQuery,
    canCreateBudget,
    retryBoth,
  }
}

export type { ScopeFilter }
