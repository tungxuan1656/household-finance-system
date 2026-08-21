import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PeriodChipLink } from '@/features/period/components/period-chip-link'
import {
  createCustomPeriodSelection,
  createReportingPeriodPresetSelection,
} from '@/lib/period/selectors'
import type { PeriodSelection } from '@/lib/period/types'
import { DAY_IN_MS } from '@/lib/period/vietnam-time'
import { selection } from '@/lib/telegram/haptics'

interface StatisticsPeriodToggleProps {
  selectedPeriod: PeriodSelection
  onChange: (next: PeriodSelection) => void
}

export const StatisticsPeriodToggle = ({
  selectedPeriod,
  onChange,
}: StatisticsPeriodToggleProps) => {
  const toggleValue =
    selectedPeriod.granularity === 'custom'
      ? selectedPeriod.dateTo - selectedPeriod.dateFrom === DAY_IN_MS
        ? ['day' as const]
        : []
      : [selectedPeriod.granularity]

  return (
    <div className='flex items-center justify-between gap-3'>
      <ToggleGroup
        value={toggleValue}
        onValueChange={(values) => {
          const value = values[0]
          if (!value) return
          selection()
          if (value === 'day') {
            onChange(createCustomPeriodSelection(Date.now(), Date.now()))
          } else {
            onChange(
              createReportingPeriodPresetSelection(
                value === 'month'
                  ? 'thisMonth'
                  : value === 'week'
                    ? 'thisWeek'
                    : 'thisYear',
              ),
            )
          }
        }}>
        {(['day', 'week', 'month', 'year'] as const).map((range) => (
          <ToggleGroupItem key={range} aria-label={range} value={range}>
            {range[0].toUpperCase() + range.slice(1)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <PeriodChipLink />
    </div>
  )
}
