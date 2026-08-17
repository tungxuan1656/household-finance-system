import { useEffect, useEffectEvent, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { LoadingPicker } from '@/components/shared/loading-picker'
import { NativePicker } from '@/components/shared/native-picker'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
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
      {/* Reset at top */}
      <div className='flex justify-end px-1 pt-1 pb-2'>
        <TmaHapticButton
          disabled={!isFilterActive}
          size='sm'
          variant='ghost'
          onClick={handleReset}>
          {t('expenses.filter.reset')}
        </TmaHapticButton>
      </div>

      <section className='mt-0'>
        <h2 className='mb-3 text-base leading-tight font-semibold text-foreground'>
          {t('expenses.filter.sortTitle')}
        </h2>
        <ToggleGroup
          className='grid w-full grid-cols-2 gap-1.5 rounded-[18px] bg-muted/70 p-1.5 shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground),transparent_94%)]'
          value={[filter.sort]}
          onValueChange={(values) => {
            const next = values[0]
            if (next && next !== filter.sort) {
              selection()
              handleSortChange(next as typeof filter.sort)
            }
          }}>
          {makeSortOptions(t).map((option) => (
            <ToggleGroupItem
              key={option.value}
              className='min-h-9 rounded-[13px] px-2 text-xs font-bold text-muted-foreground transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/30 data-[state=on]:bg-primary/12 data-[state=on]:text-primary'
              type='button'
              value={option.value}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>

      <PeriodPickerSection value={periodValue} onChange={handlePeriodChange} />

      <section className='mt-6'>
        <h2 className='mb-3 text-base leading-tight font-semibold text-foreground'>
          {t('expenses.filter.householdTitle')}
        </h2>
        {householdsQuery.isLoading ? (
          <LoadingPicker loadingLabel={t('expenses.filter.householdLoading')} />
        ) : (
          <NativePicker
            fullWidth
            options={householdPickerOptions}
            placeholder={t('expenses.filter.householdPlaceholder')}
            value={filter.householdId ?? ALL_VALUE}
            onChange={handleHouseholdChange}
          />
        )}
      </section>

      <section className='mt-6'>
        <h2 className='mb-3 text-base leading-tight font-semibold text-foreground'>
          {t('expenses.filter.groupTitle')}
        </h2>
        {personalGroupsQuery.isLoading ||
        householdGroupQueries.some((q) => q.isLoading) ? (
          <LoadingPicker loadingLabel={t('expenses.filter.householdLoading')} />
        ) : (
          <NativePicker
            fullWidth
            options={groupPickerOptions}
            placeholder={t('expenses.filter.groupTitle')}
            value={filter.groupId ?? ALL_VALUE}
            onChange={handleGroupChange}
          />
        )}
      </section>

      <section className='mt-6'>
        <h2 className='mb-3 text-base leading-tight font-semibold text-foreground'>
          {t('expenses.filter.categoryAll')}
        </h2>
        {referenceCategoriesQuery.isLoading ? (
          <LoadingPicker loadingLabel={t('expenses.filter.householdLoading')} />
        ) : (
          <NativePicker
            fullWidth
            options={categoryPickerOptions}
            placeholder={t('expenses.filter.categoryAll')}
            value={filter.categoryKey ?? ALL_VALUE}
            onChange={handleCategoryChange}
          />
        )}
      </section>

      <TmaHapticButton className='mt-5 mb-2 w-full' onClick={handleApply}>
        {t('expenses.filter.apply')}
      </TmaHapticButton>
    </TmaPageShell>
  )
}
