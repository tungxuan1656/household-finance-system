import { useEffect, useEffectEvent, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  NativePicker,
  Section,
  SectionHeader,
  SegmentedControl,
} from '@/components/ui'
import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '@/features/groups/api'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { getCategoryLabel } from '@/features/home/presentation'
import type { CategoryKey } from '@/features/home/types'
import { PeriodPickerSection } from '@/features/period/components/period-picker-section'
import { TMA_PATHS } from '@/lib/constants/routes'
import { type PeriodSelection } from '@/lib/period'
import {
  hideBottomButton,
  setBottomButton,
  updateBottomButton,
} from '@/lib/telegram/bottom-button'
import { impact, selection } from '@/lib/telegram/haptics'

import {
  type ExpenseListSort,
  useExpenseListFilterStore,
} from '../filter-store'

const makeSortOptions = (
  t: (key: string) => string,
): Array<{ label: string; value: ExpenseListSort }> => [
  { label: t('expenses.filter.sortNewest'), value: 'occurred_at_desc' },
  { label: t('expenses.filter.sortAmount'), value: 'amount_desc' },
]

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
  const reset = useExpenseListFilterStore((state) => state.reset)

  const householdsQuery = useHouseholdsQuery()
  const referenceCategoriesQuery = useReferenceCategoriesQuery()

  const households = useMemo(
    () => householdsQuery.data?.items ?? [],
    [householdsQuery.data?.items],
  )
  const referenceCategories = referenceCategoriesQuery.data?.items ?? []
  const categoryOptions = useMemo(
    () =>
      referenceCategories
        .filter((category) => category.kind === 'expense')
        .map((category) => category.key),
    [referenceCategories],
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

  // Filter groups by selected household
  const filteredGroups = useMemo(() => {
    if (filter.householdId == null) return allGroups

    return allGroups.filter(
      (g) => g.householdId === filter.householdId || g.householdId == null,
    )
  }, [allGroups, filter.householdId])

  useEffect(() => {
    const state = location.state as FilterReturnState | null

    if (state?.appliedPeriod) {
      setFilter({
        dateFrom: state.appliedPeriod.dateFrom,
        dateTo: state.appliedPeriod.dateTo,
      })
    }
  }, [location.state, setFilter])

  const handlePeriodChange = useEffectEvent(
    (period: PeriodSelection | null) => {
      if (!period) {
        setFilter({ dateFrom: undefined, dateTo: undefined })

        return
      }

      setFilter({
        dateFrom: period.dateFrom,
        dateTo: period.dateTo,
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

  useEffect(() => {
    const cleanup = setBottomButton({
      text: t('expenses.filter.apply'),
      enabled: true,
      showProgress: false,
      onClick: () => {
        handleApply()
      },
    })

    return () => {
      cleanup()
      hideBottomButton()
    }
  }, [])

  useEffect(() => {
    updateBottomButton({
      text: t('expenses.filter.apply'),
      enabled: true,
      showProgress: false,
    })
  }, [filter])

  const handleReset = () => {
    impact('light')
    reset()
  }

  const handleSortChange = (next: ExpenseListSort) => {
    selection()
    setFilter({ sort: next })
  }

  const householdPickerOptions = useMemo(
    () => [
      { label: t('expenses.filter.householdAll'), value: ALL_VALUE },
      ...households.map((h) => ({ label: h.name, value: h.id })),
    ],
    [households, t],
  )

  const groupPickerOptions = useMemo(
    () => [
      { label: t('expenses.filter.groupAll'), value: ALL_VALUE },
      ...filteredGroups.map((g) => ({
        label: g.name,
        value: g.id,
      })),
    ],
    [filteredGroups, t],
  )

  const categoryPickerOptions = useMemo(
    () => [
      { label: t('expenses.filter.categoryAll'), value: ALL_VALUE },
      ...categoryOptions.map((key) => ({
        label: getCategoryLabel(key, t),
        value: key,
      })),
    ],
    [categoryOptions, t],
  )

  const handleHouseholdChange = (value: string) => {
    selection()
    if (value === ALL_VALUE) {
      setFilter({ householdId: undefined })
    } else {
      // Clear group if it doesn't belong to new household
      const newGroupBelongs =
        filter.groupId == null ||
        allGroups.some(
          (g) =>
            g.id === filter.groupId &&
            (g.householdId === value || g.householdId == null),
        )

      setFilter({
        householdId: value,
        ...(newGroupBelongs ? {} : { groupId: undefined }),
      })
    }
  }

  const handleGroupChange = (value: string) => {
    selection()
    if (value === ALL_VALUE) {
      setFilter({ groupId: undefined })
    } else {
      setFilter({ groupId: value })
    }
  }

  const handleCategoryChange = (value: string) => {
    selection()
    if (value === ALL_VALUE) {
      setFilter({ categoryKey: undefined })
    } else {
      setFilter({ categoryKey: value as CategoryKey })
    }
  }

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
    filter.dateFrom != null ||
    filter.householdId != null ||
    filter.groupId != null ||
    filter.categoryKey != null

  return (
    <TmaPageShell reserveBottomButton title={t('expenses.filter.title')}>
      {/* Reset at top */}
      <div className='flex justify-end px-1 pt-1 pb-2'>
        <Button
          disabled={!isFilterActive}
          size='sm'
          variant='ghost'
          onClick={handleReset}>
          {t('expenses.filter.reset')}
        </Button>
      </div>

      <Section className='mt-0'>
        <SectionHeader title={t('expenses.filter.sortTitle')} />
        <SegmentedControl
          options={makeSortOptions(t)}
          value={filter.sort}
          onChange={handleSortChange}
        />
      </Section>

      <PeriodPickerSection value={periodValue} onChange={handlePeriodChange} />

      <Section>
        <SectionHeader title={t('expenses.filter.householdTitle')} />
        {householdsQuery.isLoading ? (
          <NativePicker
            disabled
            fullWidth
            options={[
              { label: t('expenses.filter.householdLoading'), value: '' },
            ]}
            value=''
            onChange={() => {}}
          />
        ) : (
          <NativePicker
            fullWidth
            options={householdPickerOptions}
            placeholder={t('expenses.filter.householdPlaceholder')}
            value={filter.householdId ?? ALL_VALUE}
            onChange={handleHouseholdChange}
          />
        )}
      </Section>

      <Section>
        <SectionHeader title={t('expenses.filter.groupTitle')} />
        {personalGroupsQuery.isLoading ||
        householdGroupQueries.some((q) => q.isLoading) ? (
          <NativePicker
            disabled
            fullWidth
            options={[
              { label: t('expenses.filter.householdLoading'), value: '' },
            ]}
            value=''
            onChange={() => {}}
          />
        ) : (
          <NativePicker
            fullWidth
            options={groupPickerOptions}
            placeholder={t('expenses.filter.groupTitle')}
            value={filter.groupId ?? ALL_VALUE}
            onChange={handleGroupChange}
          />
        )}
      </Section>

      <Section>
        <SectionHeader title={t('expenses.filter.categoryAll')} />
        {referenceCategoriesQuery.isLoading ? (
          <NativePicker
            disabled
            fullWidth
            options={[
              { label: t('expenses.filter.householdLoading'), value: '' },
            ]}
            value=''
            onChange={() => {}}
          />
        ) : (
          <NativePicker
            fullWidth
            options={categoryPickerOptions}
            placeholder={t('expenses.filter.categoryAll')}
            value={filter.categoryKey ?? ALL_VALUE}
            onChange={handleCategoryChange}
          />
        )}
      </Section>
    </TmaPageShell>
  )
}
