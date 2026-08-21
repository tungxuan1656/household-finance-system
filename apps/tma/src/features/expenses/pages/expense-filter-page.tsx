import { useEffect, useEffectEvent, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  NativePicker,
  type NativePickerOption,
} from '@/components/shared/native-picker'
import { type QueryLike, QueryState } from '@/components/shared/query-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageFooter, TmaPageShell } from '@/components/shared/tma-page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '@/features/groups/api'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { PeriodPickerSection } from '@/features/period/components/period-picker-section'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  createReportingPeriodPresetSelection,
  getMatchingReportingPeriodPreset,
  type PeriodSelection,
} from '@/lib/period'
import { selection } from '@/lib/telegram/haptics'

import { useExpenseFilterOptions } from '../hooks/use-expense-filter-options'
import { useExpenseListFilterStore } from '../model/filter-store'

const ALL_VALUE = '__all__'

interface FilterReturnState {
  appliedPeriod?: PeriodSelection
}

interface ExpenseFilterPickerFieldProps {
  id: string
  value: string
  placeholder?: string
  options: NativePickerOption[]
  onChange: (value: string) => void
}

const ExpenseFilterPickerField = ({
  id,
  options,
  placeholder,
  value,
  onChange,
}: ExpenseFilterPickerFieldProps) => (
  <NativePicker
    fullWidth
    id={id}
    options={options}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
)

export const ExpenseFilterPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const filter = useExpenseListFilterStore((state) => state.filter)
  const setFilter = useExpenseListFilterStore((state) => state.setFilter)
  const setDefaultPeriod = useExpenseListFilterStore(
    (state) => state.setDefaultPeriod,
  )

  const householdsQuery = useHouseholdsQuery()
  const referenceCategoriesQuery = useReferenceCategoriesQuery()

  const households = useMemo(
    () => householdsQuery.data?.items ?? [],
    [householdsQuery.data?.items],
  )

  // Group queries
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
  const householdGroupQueries = useHouseholdExpenseGroupQueries(households)

  const allGroups = useMemo(() => {
    const groups = [...(personalGroupsQuery.data?.items ?? [])]

    householdGroupQueries.forEach((query) => {
      if (query.data?.items) {
        groups.push(...query.data.items)
      }
    })

    return groups
  }, [personalGroupsQuery.data, householdGroupQueries])

  const groupsQuery = useMemo<QueryLike<unknown>>(() => {
    const queries = [
      personalGroupsQuery,
      ...householdGroupQueries,
    ] as QueryLike<unknown>[]
    const hasError = queries.some((q) => q.status === 'error')
    const isPending = queries.some((q) => q.status === 'pending')
    const isFetching = queries.some((q) => q.fetchStatus === 'fetching')

    if (hasError) {
      return {
        status: 'error',
        fetchStatus: isFetching ? 'fetching' : 'idle',
        data: undefined,
        refetch: () => {
          void personalGroupsQuery.refetch?.()

          householdGroupQueries.forEach((q) => {
            void (q.refetch as (() => unknown) | undefined)?.()
          })
        },
      }
    }

    if (isPending) {
      return {
        status: 'pending',
        fetchStatus: 'fetching',
        data: undefined,
      }
    }

    return {
      status: 'success',
      fetchStatus: isFetching ? 'fetching' : 'idle',
      data: { items: allGroups },
      refetch: () => {
        void personalGroupsQuery.refetch?.()

        householdGroupQueries.forEach((q) => {
          void (q.refetch as (() => unknown) | undefined)?.()
        })
      },
    }
  }, [personalGroupsQuery, householdGroupQueries, allGroups])

  useEffect(() => {
    const state = location.state as FilterReturnState | null

    if (state?.appliedPeriod) {
      const matched = getMatchingReportingPeriodPreset(state.appliedPeriod)

      setFilter({
        dateFrom: state.appliedPeriod.dateFrom,
        dateTo: state.appliedPeriod.dateTo,
        periodPreset: matched === 'thisMonth' ? 'thisMonth' : 'custom',
      })
    }
  }, [location.state, setFilter])

  const handlePeriodChange = useEffectEvent(
    (period: PeriodSelection | null) => {
      if (!period) {
        setDefaultPeriod()

        return
      }

      const matched = getMatchingReportingPeriodPreset(period)

      setFilter({
        dateFrom: period.dateFrom,
        dateTo: period.dateTo,
        periodPreset: matched === 'thisMonth' ? 'thisMonth' : 'custom',
      })
    },
  )

  const handleApply = useEffectEvent(() => {
    if ((window.history.state as { idx?: number } | null)?.idx) {
      navigate(-1)

      return
    }

    navigate(TMA_PATHS.expenses, { replace: true })
  })

  const {
    makeSortOptions,
    householdPickerOptions,
    groupPickerOptions,
    categoryPickerOptions,
    handleHouseholdChange,
    handleGroupChange,
    handleCategoryChange,
    handleReset,
    handleSortChange,
  } = useExpenseFilterOptions(
    filter,
    allGroups,
    households,
    referenceCategoriesQuery.data?.items ?? [],
    t,
  )

  const periodValue: PeriodSelection | null = useMemo(() => {
    if (filter.dateFrom != null && filter.dateTo != null) {
      const temp: PeriodSelection = {
        granularity: 'custom',
        dateFrom: filter.dateFrom,
        dateTo: filter.dateTo,
      }
      const matched = getMatchingReportingPeriodPreset(temp)
      if (matched) {
        const presetSelection = createReportingPeriodPresetSelection(matched)

        return {
          granularity: presetSelection.granularity,
          dateFrom: filter.dateFrom,
          dateTo: filter.dateTo,
        }
      }

      return temp
    }

    return null
  }, [filter.dateFrom, filter.dateTo])

  const isFilterActive =
    filter.sort !== 'occurred_at_desc' ||
    filter.periodPreset === 'custom' ||
    filter.householdId != null ||
    filter.groupId != null ||
    filter.categoryKey != null

  return (
    <TmaPageShell
      contentClassName='gap-5'
      footer={
        <TmaPageFooter>
          <TmaHapticButton
            disabled={!isFilterActive}
            variant='outline'
            onClick={() => {
              selection()
              handleReset()
            }}>
            {t('expenses.filter.reset')}
          </TmaHapticButton>
          <TmaHapticButton onClick={handleApply}>
            {t('expenses.filter.apply')}
          </TmaHapticButton>
        </TmaPageFooter>
      }
      title={t('expenses.filter.title')}>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm'>
            {t('expenses.filter.sortTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            className='flex w-full gap-2 *:flex-1 *:justify-center'
            value={[filter.sort]}
            onValueChange={(values) => {
              const next = values[0]
              if (next && next !== filter.sort) {
                selection()
                handleSortChange(next as typeof filter.sort)
              }
            }}>
            {makeSortOptions(t).map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>

      <PeriodPickerSection value={periodValue} onChange={handlePeriodChange} />

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm'>
            {t('expenses.filter.detailsTitle', {
              defaultValue: 'Bộ lọc chi tiết',
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className='gap-4'>
            <Field>
              <FieldLabel htmlFor='expense-filter-household-picker'>
                {t('expenses.filter.householdTitle')}
              </FieldLabel>
              <QueryState query={householdsQuery} variant='plain'>
                {() => (
                  <ExpenseFilterPickerField
                    id='expense-filter-household-picker'
                    options={householdPickerOptions}
                    placeholder={t('expenses.filter.householdPlaceholder')}
                    value={filter.householdId ?? ALL_VALUE}
                    onChange={handleHouseholdChange}
                  />
                )}
              </QueryState>
            </Field>

            <Field>
              <FieldLabel htmlFor='expense-filter-group-picker'>
                {t('expenses.filter.groupTitle')}
              </FieldLabel>
              <QueryState query={groupsQuery} variant='plain'>
                {() => (
                  <ExpenseFilterPickerField
                    id='expense-filter-group-picker'
                    options={groupPickerOptions}
                    placeholder={t('expenses.filter.groupTitle')}
                    value={filter.groupId ?? ALL_VALUE}
                    onChange={handleGroupChange}
                  />
                )}
              </QueryState>
            </Field>

            <Field>
              <FieldLabel htmlFor='expense-filter-category-picker'>
                {t('expenses.filter.categoryAll')}
              </FieldLabel>
              <QueryState query={referenceCategoriesQuery} variant='plain'>
                {() => (
                  <ExpenseFilterPickerField
                    id='expense-filter-category-picker'
                    options={categoryPickerOptions}
                    placeholder={t('expenses.filter.categoryAll')}
                    value={filter.categoryKey ?? ALL_VALUE}
                    onChange={handleCategoryChange}
                  />
                )}
              </QueryState>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </TmaPageShell>
  )
}
