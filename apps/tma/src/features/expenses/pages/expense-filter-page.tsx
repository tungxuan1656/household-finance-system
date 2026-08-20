import { useEffect, useEffectEvent, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { LoadingPicker } from '@/components/shared/loading-picker'
import { NativePicker } from '@/components/shared/native-picker'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
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
import { type PeriodSelection } from '@/lib/period'
import { selection } from '@/lib/telegram/haptics'

import { useExpenseListFilterStore } from '../filter-store'
import { useExpenseFilterOptions } from '../hooks/use-expense-filter-options'

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

  useEffect(() => {
    const state = location.state as FilterReturnState | null

    if (state?.appliedPeriod) {
      setFilter({
        dateFrom: state.appliedPeriod.dateFrom,
        dateTo: state.appliedPeriod.dateTo,
        periodPreset: 'custom',
      })
    }
  }, [location.state, setFilter])

  const handlePeriodChange = useEffectEvent(
    (period: PeriodSelection | null) => {
      if (!period) {
        setDefaultPeriod()

        return
      }

      setFilter({
        dateFrom: period.dateFrom,
        dateTo: period.dateTo,
        periodPreset: 'custom',
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
      return {
        granularity: 'custom',
        dateFrom: filter.dateFrom,
        dateTo: filter.dateTo,
      }
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
    <TmaPageShell title={t('expenses.filter.title')}>
      <div className='flex justify-end'>
        <TmaHapticButton
          disabled={!isFilterActive}
          size='sm'
          variant='ghost'
          onClick={handleReset}>
          {t('expenses.filter.reset')}
        </TmaHapticButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.filter.sortTitle')}</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.filter.householdTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='expense-filter-household-picker'>
                {t('expenses.filter.householdTitle')}
              </FieldLabel>
              {householdsQuery.isLoading ? (
                <LoadingPicker
                  id='expense-filter-household-picker'
                  loadingLabel={t('expenses.filter.householdLoading')}
                />
              ) : (
                <NativePicker
                  fullWidth
                  id='expense-filter-household-picker'
                  options={householdPickerOptions}
                  placeholder={t('expenses.filter.householdPlaceholder')}
                  value={filter.householdId ?? ALL_VALUE}
                  onChange={handleHouseholdChange}
                />
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.filter.groupTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='expense-filter-group-picker'>
                {t('expenses.filter.groupTitle')}
              </FieldLabel>
              {personalGroupsQuery.isLoading ||
              householdGroupQueries.some((q) => q.isLoading) ? (
                <LoadingPicker
                  id='expense-filter-group-picker'
                  loadingLabel={t('expenses.filter.householdLoading')}
                />
              ) : (
                <NativePicker
                  fullWidth
                  id='expense-filter-group-picker'
                  options={groupPickerOptions}
                  placeholder={t('expenses.filter.groupTitle')}
                  value={filter.groupId ?? ALL_VALUE}
                  onChange={handleGroupChange}
                />
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.filter.categoryAll')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='expense-filter-category-picker'>
                {t('expenses.filter.categoryAll')}
              </FieldLabel>
              {referenceCategoriesQuery.isLoading ? (
                <LoadingPicker
                  id='expense-filter-category-picker'
                  loadingLabel={t('expenses.filter.householdLoading')}
                />
              ) : (
                <NativePicker
                  fullWidth
                  id='expense-filter-category-picker'
                  options={categoryPickerOptions}
                  placeholder={t('expenses.filter.categoryAll')}
                  value={filter.categoryKey ?? ALL_VALUE}
                  onChange={handleCategoryChange}
                />
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <TmaHapticButton className='mt-5 mb-2 w-full' onClick={handleApply}>
        {t('expenses.filter.apply')}
      </TmaHapticButton>
    </TmaPageShell>
  )
}
