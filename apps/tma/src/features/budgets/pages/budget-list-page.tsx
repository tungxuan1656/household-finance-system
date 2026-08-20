import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { DataState } from '@/components/shared/data-state'
import {
  NativePicker,
  type NativePickerOption,
} from '@/components/shared/native-picker'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useHouseholdsQuery } from '@/features/home/api'
import { formatCurrencyMinor } from '@/features/home/presentation'
import { getBudgetDetailPath, TMA_PATHS } from '@/lib/constants/routes'

import { useBudgetListQuery } from '../api'
import { formatBudgetPeriodLabel, getBudgetScopeLabel } from '../presentation'

type ScopeFilter = 'all' | 'household' | 'personal'

export const BudgetListPage = () => {
  const { t } = useTranslation()
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []
  const adminHouseholds = households.filter(
    (household) => household.role === 'admin',
  )
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all')

  const SCOPE_FILTER_OPTIONS: { label: string; value: ScopeFilter }[] = [
    { label: t('budgets.filterAll'), value: 'all' },
    { label: t('budgets.householdLabel'), value: 'household' },
    { label: t('budgets.filterPersonal'), value: 'personal' },
  ]
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('')
  const selectedHousehold = households.find(
    (household) => household.id === selectedHouseholdId,
  )

  const householdOptions: NativePickerOption[] = useMemo(() => {
    if (households.length === 0) {
      return [{ value: '', label: t('budgets.householdEmptyOption') }]
    }

    return households.map((h) => ({ value: h.id, label: h.name }))
  }, [households, t])

  const listParams = useMemo(() => {
    if (scopeFilter === 'personal') {
      return { scope: 'personal' as const }
    }
    if (scopeFilter === 'household') {
      return {
        scope: 'household' as const,
        householdId: selectedHouseholdId || undefined,
      }
    }

    return {}
  }, [scopeFilter, selectedHouseholdId])

  const budgetsQuery = useBudgetListQuery(listParams)
  const budgets = useMemo(
    () =>
      [...(budgetsQuery.data?.items ?? [])].sort((left, right) =>
        right.period.localeCompare(left.period),
      ),
    [budgetsQuery.data?.items],
  )

  const filteredBudgets = useMemo(() => {
    if (scopeFilter === 'all') return budgets

    return budgets.filter((budget) => budget.scope === scopeFilter)
  }, [budgets, scopeFilter])

  useEffect(() => {
    if (!selectedHouseholdId && adminHouseholds[0]) {
      setSelectedHouseholdId(adminHouseholds[0].id)
    }
  }, [adminHouseholds, selectedHouseholdId])

  const isInitialLoading =
    (householdsQuery.isLoading && households.length === 0) ||
    (budgetsQuery.isLoading && budgets.length === 0)
  const isInitialError =
    (householdsQuery.isError && households.length === 0) ||
    (budgetsQuery.isError && budgets.length === 0)

  const canCreateBudget =
    scopeFilter === 'personal' ||
    scopeFilter === 'all' ||
    adminHouseholds.length > 0

  const emptyTitle =
    scopeFilter === 'personal'
      ? t('budgets.emptyPersonal')
      : scopeFilter === 'household'
        ? t('budgets.emptyHousehold')
        : t('budgets.emptyGeneric')

  const emptyDescription =
    scopeFilter === 'personal'
      ? t('budgets.emptyPersonalDesc')
      : scopeFilter === 'household'
        ? t('budgets.emptyHouseholdDesc')
        : t('budgets.emptyGenericDesc')

  return (
    <TmaPageShell title={t('budgets.title')}>
      <section className='grid gap-3'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='m-0 text-base font-bold'>{t('budgets.title')}</h2>
          {canCreateBudget ? (
            <Link
              className={buttonVariants({ size: 'sm', variant: 'outline' })}
              to={TMA_PATHS.budgetsNew}>
              {t('budgets.create')}
            </Link>
          ) : null}
        </div>

        <ToggleGroup
          className='flex flex-wrap gap-2'
          value={[scopeFilter]}
          onValueChange={(values) => {
            const next = values[0] as ScopeFilter | undefined
            if (next) setScopeFilter(next)
          }}>
          {SCOPE_FILTER_OPTIONS.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {scopeFilter === 'household' ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('budgets.householdLabel')}</CardTitle>
              {selectedHousehold?.role !== 'admin' ? (
                <CardDescription>
                  {t('budgets.householdViewOnly')}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor='budget-household-filter'>
                    {t('budgets.householdLabel')}
                  </FieldLabel>
                  <NativePicker
                    fullWidth
                    aria-label={t('budgets.chooseHousehold')}
                    disabled={
                      householdsQuery.isLoading || households.length === 0
                    }
                    id='budget-household-filter'
                    options={householdOptions}
                    value={selectedHouseholdId}
                    onChange={(next) => setSelectedHouseholdId(next)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        ) : null}

        <DataState
          customAction={
            filteredBudgets.length === 0 &&
            !isInitialLoading &&
            canCreateBudget ? (
              <Link
                className={buttonVariants({ variant: 'secondary' })}
                to={TMA_PATHS.budgetsNew}>
                {t('budgets.create')}
              </Link>
            ) : null
          }
          emptyDescription={emptyDescription}
          emptyTitle={emptyTitle}
          errorDescription={t('budgets.loadErrorDesc')}
          errorTitle={t('budgets.loadError')}
          isEmpty={
            !isInitialLoading && !isInitialError && filteredBudgets.length === 0
          }
          isError={isInitialError}
          isLoading={isInitialLoading}
          loadingDescription={t('budgets.loadingDesc')}
          loadingTitle={t('budgets.loadingTitle')}
          retryAction={async () => {
            await Promise.all([
              householdsQuery.refetch(),
              budgetsQuery.refetch(),
            ])
          }}>
          <div className='grid gap-3'>
            {filteredBudgets.map((budget) => {
              const household = households.find(
                (h) => h.id === budget.householdId,
              )

              return (
                <Link
                  key={budget.id}
                  className='block'
                  to={getBudgetDetailPath(budget.id)}>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-base font-semibold'>
                        {formatBudgetPeriodLabel(budget.period, t)}
                      </CardTitle>
                      <Badge
                        variant={
                          budget.scope === 'personal' ? 'secondary' : 'outline'
                        }>
                        {getBudgetScopeLabel(budget.scope, household, t)}
                      </Badge>
                    </CardHeader>
                    <CardContent className='flex items-center justify-between gap-3'>
                      <span className='shrink-0 text-base font-extrabold text-foreground'>
                        {formatCurrencyMinor(
                          budget.totalLimitMinor,
                          budget.currencyCode,
                        )}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </DataState>
      </section>
    </TmaPageShell>
  )
}
