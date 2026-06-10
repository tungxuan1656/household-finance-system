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
import type { PeriodSelection } from '@/lib/period'
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

type PresetKey = 'today' | 'thisWeek' | 'thisMonth' | 'custom'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

const startOfDay = (timestamp: number): number => {
  const date = new Date(timestamp)

  date.setHours(0, 0, 0, 0)

  return date.getTime()
}

const getWeekRange = (timestamp: number): { from: number; to: number } => {
  const date = new Date(timestamp)
  const day = date.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day

  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + diffToMonday)

  const from = date.getTime()
  const to = from + 7 * ONE_DAY_MS

  return { from, to }
}

const getMonthRange = (timestamp: number): { from: number; to: number } => {
  const date = new Date(timestamp)

  date.setDate(1)
  date.setHours(0, 0, 0, 0)

  const from = date.getTime()

  const next = new Date(date)
  next.setMonth(next.getMonth() + 1)

  return { from, to: next.getTime() }
}

const PRESET_PRESETS: Array<{ label: string; value: PresetKey }> = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Tuần này', value: 'thisWeek' },
  { label: 'Tháng này', value: 'thisMonth' },
]

const resolvePreset = (
  preset: PresetKey,
): { dateFrom?: number; dateTo?: number } => {
  const now = Date.now()

  if (preset === 'today') {
    const start = startOfDay(now)

    return { dateFrom: start, dateTo: start + ONE_DAY_MS }
  }

  if (preset === 'thisWeek') {
    const { from, to } = getWeekRange(now)

    return { dateFrom: from, dateTo: to }
  }

  if (preset === 'thisMonth') {
    const { from, to } = getMonthRange(now)

    return { dateFrom: from, dateTo: to }
  }

  return {}
}

const detectActivePreset = (filter: ExpenseListFilter): PresetKey | null => {
  if (filter.dateFrom == null && filter.dateTo == null) {
    return null
  }

  const { dateFrom, dateTo } = resolvePreset('today')

  if (filter.dateFrom === dateFrom && filter.dateTo === dateTo) {
    return 'today'
  }

  const week = resolvePreset('thisWeek')

  if (filter.dateFrom === week.dateFrom && filter.dateTo === week.dateTo) {
    return 'thisWeek'
  }

  const month = resolvePreset('thisMonth')

  if (filter.dateFrom === month.dateFrom && filter.dateTo === month.dateTo) {
    return 'thisMonth'
  }

  return 'custom'
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

const formatRangeLabel = (dateFrom: number, dateTo: number): string => {
  const fromDate = new Date(dateFrom)
  const toDate = new Date(dateTo - ONE_DAY_MS)
  const fromLabel = `${fromDate.getDate()}/${fromDate.getMonth() + 1}/${fromDate.getFullYear()}`
  const toLabel = `${toDate.getDate()}/${toDate.getMonth() + 1}/${toDate.getFullYear()}`

  return `${fromLabel} → ${toLabel}`
}

const previewDescription = (
  filter: ExpenseListFilter,
  households: Array<{ id: string; name: string }>,
): string => {
  const parts: string[] = []

  if (filter.dateFrom != null && filter.dateTo != null) {
    parts.push(
      `trong khoảng ${formatRangeLabel(filter.dateFrom, filter.dateTo)}`,
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

  const [activePreset, setActivePreset] = useState<PresetKey | null>(() =>
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

  const handlePresetToggle = useEffectEvent((preset: PresetKey) => {
    if (activePreset === preset) {
      setActivePreset(null)
      setFilter({ dateFrom: undefined, dateTo: undefined })

      return
    }

    setActivePreset(preset)
    setFilter(resolvePreset(preset))
  })

  const handleCustomPeriod = useEffectEvent(() => {
    const initialPeriod: PeriodSelection | null =
      filter.dateFrom != null && filter.dateTo != null
        ? {
            granularity: 'month',
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
          {PRESET_PRESETS.map((preset) => (
            <FilterChipButton
              key={preset.value}
              active={activePreset === preset.value}
              label={preset.label}
              onClick={() => handlePresetToggle(preset.value)}
            />
          ))}
          <FilterChipButton
            active={activePreset === 'custom'}
            label={
              activePreset === 'custom' &&
              filter.dateFrom != null &&
              filter.dateTo != null
                ? `Khoảng khác · ${formatRangeLabel(filter.dateFrom, filter.dateTo)}`
                : 'Khoảng khác...'
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
