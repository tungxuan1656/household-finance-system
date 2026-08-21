import { useEffect, useEffectEvent, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { NativePicker } from '@/components/shared/native-picker'
import { QueryState } from '@/components/shared/query-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageFooter, TmaPageShell } from '@/components/shared/tma-page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useExpenseGroupAggregateQuery } from '@/features/groups/api'
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

  const groupsQuery = useExpenseGroupAggregateQuery(households)

  const allGroups = useMemo(
    () => groupsQuery.data?.items ?? [],
    [groupsQuery.data],
  )

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
      contentClassName='gap-4'
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
      <Card size='sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm tracking-normal normal-case'>
            {t('expenses.filter.sortTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            className='grid w-full grid-cols-2 gap-2'
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

      <Card size='sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm tracking-normal normal-case'>
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
                  <NativePicker
                    fullWidth
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
                  <NativePicker
                    fullWidth
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
                  <NativePicker
                    fullWidth
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
