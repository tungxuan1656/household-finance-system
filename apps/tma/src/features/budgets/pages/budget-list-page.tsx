import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import {
  NativePicker,
  type NativePickerOption,
} from '@/components/shared/native-picker'
import { QueryState } from '@/components/shared/query-state'
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
import type { HouseholdDTO } from '@/features/home/types'
import { getBudgetDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

import { useBudgetListQuery } from '../api'
import { formatBudgetPeriodLabel, getBudgetScopeLabel } from '../presentation'
import type { BudgetDTO, ListBudgetsResponse } from '../types'

type ScopeFilter = 'all' | 'household' | 'personal'

// ── dumb components ──────────────────────────────────────────────
// No outer margin: parent gap owns spacing. Pure layout islands.

function ScopeFilterBar({
  value,
  onChange,
  options,
}: {
  value: ScopeFilter
  onChange: (next: ScopeFilter) => void
  options: { label: string; value: ScopeFilter }[]
}) {
  return (
    <ToggleGroup
      className='flex flex-wrap gap-2'
      value={[value]}
      onValueChange={(values) => {
        const next = values[0] as ScopeFilter | undefined
        if (next) {
          impact('light')
          onChange(next)
        }
      }}>
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function HouseholdFilterCard({
  households,
  selectedHouseholdId,
  onChange,
  isLoading,
}: {
  households: HouseholdDTO[]
  selectedHouseholdId: string
  onChange: (next: string) => void
  isLoading: boolean
}) {
  const { t } = useTranslation()
  const selectedHousehold = households.find((h) => h.id === selectedHouseholdId)

  const householdOptions: NativePickerOption[] = useMemo(() => {
    if (households.length === 0) {
      return [{ value: '', label: t('budgets.householdEmptyOption') }]
    }

    return households.map((h) => ({ value: h.id, label: h.name }))
  }, [households, t])

  return (
    <Card>
      <CardHeader className='gap-1'>
        <CardTitle className='text-sm'>{t('budgets.householdLabel')}</CardTitle>
        {selectedHousehold?.role !== 'admin' ? (
          <CardDescription>{t('budgets.householdViewOnly')}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <FieldGroup className='gap-4'>
          <Field>
            <FieldLabel htmlFor='budget-household-filter'>
              {t('budgets.householdLabel')}
            </FieldLabel>
            <NativePicker
              fullWidth
              aria-label={t('budgets.chooseHousehold')}
              disabled={isLoading || households.length === 0}
              id='budget-household-filter'
              options={householdOptions}
              value={selectedHouseholdId}
              onChange={onChange}
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

function BudgetCard({
  budget,
  household,
}: {
  budget: BudgetDTO
  household?: HouseholdDTO
}) {
  const { t } = useTranslation()

  return (
    <Link
      className='block rounded-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
      to={getBudgetDetailPath(budget.id)}
      onClick={() => impact('light')}>
      <Card
        className='transition hover:bg-accent/40 active:scale-[0.99]'
        size='sm'>
        <CardHeader className='gap-1.5'>
          <CardTitle className='text-base font-semibold tracking-normal normal-case'>
            {formatBudgetPeriodLabel(budget.period, t)}
          </CardTitle>
          <Badge
            variant={budget.scope === 'personal' ? 'secondary' : 'outline'}>
            {getBudgetScopeLabel(budget.scope, household, t)}
          </Badge>
        </CardHeader>
        <CardContent className='flex items-center justify-between gap-3'>
          <span className='shrink-0 text-base font-extrabold text-foreground tabular-nums'>
            {formatCurrencyMinor(budget.totalLimitMinor, budget.currencyCode)}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

function BudgetListContent({
  budgetsQuery,
  households,
  scopeFilter,
  canCreateBudget,
  retryBoth,
}: {
  budgetsQuery: ReturnType<typeof useBudgetListQuery>
  households: HouseholdDTO[]
  scopeFilter: ScopeFilter
  canCreateBudget: boolean
  retryBoth: () => Promise<void>
}) {
  const { t } = useTranslation()
  const householdById = useMemo(
    () => new Map(households.map((h) => [h.id, h] as const)),
    [households],
  )

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
    <QueryState
      empty={{
        title: emptyTitle,
        description: emptyDescription,
        action: canCreateBudget ? (
          <Link
            className={buttonVariants({ size: 'sm', variant: 'secondary' })}
            to={TMA_PATHS.budgetsNew}
            onClick={() => impact('light')}>
            {t('budgets.create')}
          </Link>
        ) : undefined,
      }}
      error={{
        title: t('budgets.loadError'),
        description: t('budgets.loadErrorDesc'),
      }}
      isEmpty={(data: ListBudgetsResponse) => {
        const items = data.items ?? []
        if (scopeFilter === 'all') return items.length === 0

        return items.filter((b) => b.scope === scopeFilter).length === 0
      }}
      pending={{
        title: t('budgets.loadingTitle'),
        description: t('budgets.loadingDesc'),
      }}
      query={budgetsQuery}
      retryAction={retryBoth}
      variant='card'>
      {(data: ListBudgetsResponse) => {
        const sorted = [...(data.items ?? [])].sort((a, b) =>
          b.period.localeCompare(a.period),
        )
        const filtered =
          scopeFilter === 'all'
            ? sorted
            : sorted.filter((b) => b.scope === scopeFilter)

        return (
          <div className='grid gap-3'>
            {filtered.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                household={
                  budget.householdId
                    ? householdById.get(budget.householdId)
                    : undefined
                }
              />
            ))}
          </div>
        )
      }}
    </QueryState>
  )
}

// ── page ─────────────────────────────────────────────────────────

export const BudgetListPage = () => {
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

  return (
    <TmaPageShell
      contentClassName='flex flex-col gap-4'
      title={t('budgets.title')}
      onRefresh={retryBoth}>
      {/* Header: title + create CTA — no duplicate Card, parent gap owns rhythm */}
      <div className='flex items-center justify-between gap-3'>
        <h2 className='m-0 text-base font-bold'>{t('budgets.title')}</h2>
        {canCreateBudget ? (
          <Link
            className={buttonVariants({ size: 'sm', variant: 'secondary' })}
            to={TMA_PATHS.budgetsNew}
            onClick={() => impact('light')}>
            {t('budgets.create')}
          </Link>
        ) : null}
      </div>

      <ScopeFilterBar
        options={scopeFilterOptions}
        value={scopeFilter}
        onChange={setScopeFilter}
      />

      {/* Nested QueryState: outer households (pending/error), inner budgets (pending/empty/error) */}
      <QueryState
        error={{
          title: t('budgets.loadError'),
          description: t('budgets.loadErrorDesc'),
        }}
        isEmpty={() => false}
        pending={{
          title: t('budgets.loadingTitle'),
          description: t('budgets.loadingDesc'),
        }}
        query={householdsQuery}
        retryAction={retryBoth}
        variant='card'>
        {(householdsData) => (
          <div className='flex flex-col gap-4'>
            {scopeFilter === 'household' ? (
              <HouseholdFilterCard
                households={householdsData.items}
                isLoading={householdsQuery.isLoading}
                selectedHouseholdId={selectedHouseholdId}
                onChange={setSelectedHouseholdId}
              />
            ) : null}

            <BudgetListContent
              budgetsQuery={budgetsQuery}
              canCreateBudget={canCreateBudget}
              households={householdsData.items}
              retryBoth={retryBoth}
              scopeFilter={scopeFilter}
            />
          </div>
        )}
      </QueryState>
    </TmaPageShell>
  )
}
