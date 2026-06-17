import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  buttonVariants,
  Card,
  CardDescription,
  Chip,
  DataState,
  Field,
  FieldLabel,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
import {
  NativePicker,
  type NativePickerOption,
} from '@/components/ui/native-picker'
import { useHouseholdsQuery } from '@/features/home/api'
import { formatCurrencyMinor } from '@/features/home/presentation'
import { getBudgetDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

import { useBudgetListQuery } from '../api'
import { formatBudgetPeriodLabel, getBudgetScopeLabel } from '../presentation'

type ScopeFilter = 'all' | 'household' | 'personal'

const ScopeFilterChip = ({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean
  label: string
  onClick: () => void
}) => (
  <button
    className={cn(
      'inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition active:scale-95',
      isSelected
        ? 'bg-tma-primary/12 text-tma-primary'
        : 'bg-black/6 text-tma-text-strong',
    )}
    type='button'
    onClick={onClick}>
    {label}
  </button>
)

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
      <Section>
        <SectionHeader
          action={
            canCreateBudget ? (
              <Link
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
                to={TMA_PATHS.budgetsNew}
                onClick={() => selection()}>
                {t('budgets.create')}
              </Link>
            ) : null
          }
          title={t('budgets.title')}
        />

        <div className='mb-3 flex flex-wrap gap-2'>
          {SCOPE_FILTER_OPTIONS.map((option) => (
            <ScopeFilterChip
              key={option.value}
              isSelected={scopeFilter === option.value}
              label={option.label}
              onClick={() => setScopeFilter(option.value)}
            />
          ))}
        </div>

        {scopeFilter === 'household' ? (
          <Card className='mb-3 grid gap-2'>
            <Field>
              <FieldLabel>{t('budgets.householdLabel')}</FieldLabel>
              <NativePicker
                fullWidth
                aria-label={t('budgets.chooseHousehold')}
                disabled={householdsQuery.isLoading || households.length === 0}
                options={householdOptions}
                value={selectedHouseholdId}
                onChange={(next) => setSelectedHouseholdId(next)}
              />
            </Field>
            {selectedHousehold?.role !== 'admin' ? (
              <CardDescription>
                {t('budgets.householdViewOnly')}
              </CardDescription>
            ) : null}
          </Card>
        ) : null}

        <DataState
          customAction={
            budgets.length === 0 && !isInitialLoading && canCreateBudget ? (
              <Link
                className={buttonVariants({ variant: 'secondary' })}
                to={TMA_PATHS.budgetsNew}
                onClick={() => selection()}>
                {t('budgets.create')}
              </Link>
            ) : null
          }
          emptyDescription={emptyDescription}
          emptyTitle={emptyTitle}
          errorDescription={t('budgets.loadErrorDesc')}
          errorTitle={t('budgets.loadError')}
          isEmpty={!isInitialLoading && !isInitialError && budgets.length === 0}
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
                  className='flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-tma-card transition active:scale-[0.99]'
                  to={getBudgetDetailPath(budget.id)}
                  onClick={() => selection()}>
                  <div className='grid min-w-0 gap-1'>
                    <span className='text-base font-semibold text-tma-text-strong'>
                      {formatBudgetPeriodLabel(budget.period, t)}
                    </span>
                    <Chip
                      className={
                        budget.scope === 'personal'
                          ? 'bg-tma-warning/20 text-[#8a6800]'
                          : undefined
                      }
                      tone={budget.scope === 'personal' ? 'warning' : 'muted'}>
                      {getBudgetScopeLabel(budget.scope, household, t)}
                    </Chip>
                  </div>
                  <MoneyLabel className='shrink-0 text-base font-extrabold'>
                    {formatCurrencyMinor(
                      budget.totalLimitMinor,
                      budget.currencyCode,
                    )}
                  </MoneyLabel>
                </Link>
              )
            })}
          </div>
        </DataState>
      </Section>
    </TmaPageShell>
  )
}
