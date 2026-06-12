import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { TmaPageHeader, TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  Eyebrow,
  Section,
  SectionHeader,
} from '@/components/ui'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { getCategoryLabel } from '@/features/home/presentation'
import type { CategoryKey } from '@/features/home/types'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  createReportingPeriodPresetSelection,
  formatPeriodSelectionRangeLabel,
  getMatchingReportingPeriodPreset,
  getReportingPeriodPresetLabel,
  type PeriodSelection,
  REPORTING_PERIOD_PRESETS,
  type ReportingPeriodPreset,
} from '@/lib/period'
import {
  hideBottomButton,
  setBottomButton,
  updateBottomButton,
} from '@/lib/telegram/bottom-button'
import { impact, selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

import {
  type ExpenseListFilter,
  type ExpenseListSort,
  useExpenseListFilterStore,
} from '../filter-store'

const SORT_OPTIONS: Array<{ label: string; value: ExpenseListSort }> = [
  { label: 'Mới nhất', value: 'occurred_at_desc' },
  { label: 'Số tiền', value: 'amount_desc' },
]

const ALL_HOUSEHOLDS_VALUE = '__all__'
const ALL_CATEGORIES_VALUE = '__all__'

type ActivePresetKey = 'custom' | ReportingPeriodPreset

const toFilterPeriodSelection = (
  filter: ExpenseListFilter,
): PeriodSelection | null => {
  if (filter.dateFrom == null && filter.dateTo == null) {
    return null
  }

  if (filter.dateFrom == null || filter.dateTo == null) {
    return null
  }

  return {
    granularity: 'custom',
    dateFrom: filter.dateFrom,
    dateTo: filter.dateTo,
  }
}

const detectActivePreset = (
  filter: ExpenseListFilter,
): ActivePresetKey | null => {
  const period = toFilterPeriodSelection(filter)

  if (!period) {
    return null
  }

  return getMatchingReportingPeriodPreset(period) ?? 'custom'
}

const FilterChipButton = ({
  active,
  className,
  label,
  onClick,
}: {
  active: boolean
  className?: string
  label: string
  onClick: () => void
}) => (
  <button
    aria-pressed={active}
    className={cn(
      'min-h-9 rounded-full border px-3.5 text-xs font-semibold transition active:scale-95',
      active
        ? 'border-tma-primary bg-tma-primary/12 text-tma-primary'
        : 'border-black/[0.06] bg-white/70 text-tma-text-strong shadow-tma-soft',
      className,
    )}
    type='button'
    onClick={onClick}>
    {label}
  </button>
)

const formatFilterRangeLabel = (dateFrom: number, dateTo: number): string =>
  formatPeriodSelectionRangeLabel({
    granularity: 'custom',
    dateFrom,
    dateTo,
  })

const previewDescription = (
  filter: ExpenseListFilter,
  households: Array<{ id: string; name: string }>,
): string => {
  const parts: string[] = []

  if (filter.dateFrom != null && filter.dateTo != null) {
    parts.push(
      `trong khoảng ${formatFilterRangeLabel(filter.dateFrom, filter.dateTo)}`,
    )
  }

  if (filter.householdId != null) {
    const match = households.find((h) => h.id === filter.householdId)

    parts.push(`trong "${match?.name ?? 'hộ đã chọn'}"`)
  }

  if (filter.categoryKey != null) {
    parts.push(`danh mục "${getCategoryLabel(filter.categoryKey)}"`)
  }

  if (parts.length === 0) {
    return 'Không có bộ lọc nào — sẽ hiển thị toàn bộ chi tiêu.'
  }

  const head = `Hiển thị chi tiêu ${parts.join(' và ')}`

  const sortLabel =
    filter.sort === 'amount_desc' ? 'theo số tiền giảm dần' : 'mới nhất trước'

  return `${head}, sắp xếp ${sortLabel}.`
}

interface FilterReturnState {
  appliedPeriod?: PeriodSelection
}

export const ExpenseFilterPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const filter = useExpenseListFilterStore((state) => state.filter)
  const setFilter = useExpenseListFilterStore((state) => state.setFilter)
  const reset = useExpenseListFilterStore((state) => state.reset)

  const [activePreset, setActivePreset] = useState<ActivePresetKey | null>(() =>
    detectActivePreset(filter),
  )

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

  useEffect(() => {
    setActivePreset(detectActivePreset(filter))
  }, [filter])

  useEffect(() => {
    const state = location.state as FilterReturnState | null

    if (state?.appliedPeriod) {
      setFilter({
        dateFrom: state.appliedPeriod.dateFrom,
        dateTo: state.appliedPeriod.dateTo,
      })
    }
  }, [location.state, setFilter])

  const handlePresetToggle = useEffectEvent((preset: ReportingPeriodPreset) => {
    if (activePreset === preset) {
      setActivePreset(null)
      setFilter({ dateFrom: undefined, dateTo: undefined })

      return
    }

    setActivePreset(preset)

    const selection = createReportingPeriodPresetSelection(preset)

    setFilter({
      dateFrom: selection.dateFrom,
      dateTo: selection.dateTo,
    })
  })

  const handleCustomPeriod = useEffectEvent(() => {
    const initialPeriod: PeriodSelection | null =
      filter.dateFrom != null && filter.dateTo != null
        ? {
            granularity: 'custom',
            dateFrom: filter.dateFrom,
            dateTo: filter.dateTo,
          }
        : null

    navigate(TMA_PATHS.period, {
      state: {
        backTo: TMA_PATHS.expensesFilter,
        initialPeriod,
      },
    })
  })

  const handleApply = useEffectEvent(() => {
    setActivePreset(
      detectActivePreset(useExpenseListFilterStore.getState().filter),
    )

    if ((window.history.state as { idx?: number } | null)?.idx) {
      navigate(-1)

      return
    }

    navigate(TMA_PATHS.expenses, { replace: true })
  })

  useEffect(() => {
    const cleanup = setBottomButton({
      text: 'Áp dụng bộ lọc',
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
      text: 'Áp dụng bộ lọc',
      enabled: true,
      showProgress: false,
    })
  }, [filter])

  const handleReset = () => {
    impact('light')
    reset()
    setActivePreset(null)
  }

  const handleSortChange = (next: ExpenseListSort) => {
    selection()
    setFilter({ sort: next })
  }

  const handleHouseholdChange = (value: string) => {
    selection()
    if (value === ALL_HOUSEHOLDS_VALUE) {
      setFilter({ householdId: undefined })
    } else {
      setFilter({ householdId: value })
    }
  }

  const handleCategoryChange = (value: string) => {
    selection()
    if (value === ALL_CATEGORIES_VALUE) {
      setFilter({ categoryKey: undefined })
    } else {
      setFilter({ categoryKey: value as CategoryKey })
    }
  }

  return (
    <TmaPageShell reserveBottomButton title='Lọc chi tiêu'>
      <TmaPageHeader
        eyebrow='Bộ lọc'
        subtitle='Chọn khoảng thời gian, hộ gia đình, danh mục và cách sắp xếp. Bấm Áp dụng để cập nhật danh sách.'
        title='Lọc danh sách chi tiêu'
      />

      <Section>
        <SectionHeader eyebrow='Sắp xếp' title='Thứ tự hiển thị' />
        <div className='grid grid-cols-2 gap-2'>
          {SORT_OPTIONS.map((option) => (
            <FilterChipButton
              key={option.value}
              active={filter.sort === option.value}
              label={option.label}
              onClick={() => handleSortChange(option.value)}
            />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow='Thời gian' title='Khoảng thời gian' />
        <div className='flex flex-wrap gap-2'>
          {REPORTING_PERIOD_PRESETS.map((preset) => (
            <FilterChipButton
              key={preset}
              active={activePreset === preset}
              label={getReportingPeriodPresetLabel(preset)}
              onClick={() => handlePresetToggle(preset)}
            />
          ))}
          <FilterChipButton
            active={activePreset === 'custom'}
            label={
              activePreset === 'custom' &&
              filter.dateFrom != null &&
              filter.dateTo != null
                ? `Từ ngày → đến ngày · ${formatFilterRangeLabel(filter.dateFrom, filter.dateTo)}`
                : 'Từ ngày → đến ngày'
            }
            onClick={handleCustomPeriod}
          />
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow='Nguồn' title='Hộ gia đình' />
        {householdsQuery.isLoading ? (
          <Card>
            <CardDescription>Đang tải danh sách hộ gia đình...</CardDescription>
          </Card>
        ) : (
          <div className='flex flex-wrap gap-2'>
            <FilterChipButton
              active={filter.householdId == null}
              label='Tất cả'
              onClick={() => handleHouseholdChange(ALL_HOUSEHOLDS_VALUE)}
            />
            {households.map((household) => (
              <FilterChipButton
                key={household.id}
                active={filter.householdId === household.id}
                label={household.name}
                onClick={() => handleHouseholdChange(household.id)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section>
        <SectionHeader eyebrow='Phân loại' title='Danh mục chi tiêu' />
        {referenceCategoriesQuery.isLoading ? (
          <Card>
            <CardDescription>Đang tải danh mục...</CardDescription>
          </Card>
        ) : (
          <div className='grid grid-cols-2 gap-2'>
            <FilterChipButton
              active={filter.categoryKey == null}
              label='Tất cả'
              onClick={() => handleCategoryChange(ALL_CATEGORIES_VALUE)}
            />
            {categoryOptions.map((categoryKey) => (
              <FilterChipButton
                key={categoryKey}
                active={filter.categoryKey === categoryKey}
                label={getCategoryLabel(categoryKey)}
                onClick={() => handleCategoryChange(categoryKey)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section>
        <Card className='flex items-center justify-between gap-3'>
          <div className='grid gap-1'>
            <Eyebrow>Xem trước</Eyebrow>
            <CardDescription>
              {previewDescription(filter, households)}
            </CardDescription>
          </div>
          <Button size='sm' variant='ghost' onClick={handleReset}>
            Đặt lại tất cả
          </Button>
        </Card>
      </Section>
    </TmaPageShell>
  )
}
