import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/components/shared/date-picker'
import { CalendarIcon } from '@/components/shared/tma-icons'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  createCustomPeriodSelection,
  createReportingPeriodPresetSelection,
  formatPeriodDateInputValue,
  formatPeriodSelectionRangeLabel,
  getMatchingReportingPeriodPreset,
  getReportingPeriodPresetLabel,
  parsePeriodDateInputValue,
  type PeriodSelection,
  REPORTING_PERIOD_PRESETS,
  type ReportingPeriodPreset,
} from '@/lib/period'
import { selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

const PeriodTimelineDateButton = ({
  inputLabel,
  label,
  onChange,
  inputValue,
}: {
  inputLabel: string
  label: string
  onChange: (value: string) => void
  inputValue: string
}) => (
  <DatePicker
    fullWidth
    aria-label={inputLabel}
    placeholder={label}
    value={inputValue}
    onChange={onChange}
  />
)

const PeriodRangeTimeline = ({
  candidate,
  onFromChange,
  onToChange,
  t,
}: {
  candidate: PeriodSelection
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  t: (key: string) => string
}) => (
  <div className='grid grid-cols-[1fr_auto_1fr] items-stretch gap-2.5'>
    <PeriodTimelineDateButton
      inputLabel={t('period.fieldFromPlaceholder')}
      inputValue={formatPeriodDateInputValue(candidate.dateFrom)}
      label={t('period.fieldFrom')}
      onChange={onFromChange}
    />
    <div
      aria-hidden='true'
      className='grid place-items-center text-muted-foreground'>
      <svg
        fill='none'
        height='14'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        viewBox='0 0 24 24'
        width='14'>
        <path d='M5 12h14' />
        <path d='m13 6 6 6-6 6' />
      </svg>
    </div>
    <PeriodTimelineDateButton
      inputLabel={t('period.fieldToPlaceholder')}
      inputValue={formatPeriodDateInputValue(candidate.dateTo - 1)}
      label={t('period.fieldTo')}
      onChange={onToChange}
    />
  </div>
)

export interface PeriodPickerSectionProps {
  value: PeriodSelection | null
  onChange: (value: PeriodSelection | null) => void
}

export const PeriodPickerSection = ({
  value,
  onChange,
}: PeriodPickerSectionProps) => {
  const { t } = useTranslation()
  const [candidate, setCandidate] = useState<PeriodSelection>(
    value ?? {
      granularity: 'custom',
      dateFrom: 0,
      dateTo: 0,
    },
  )

  const activePreset = useMemo(
    () =>
      candidate.granularity === 'custom'
        ? null
        : getMatchingReportingPeriodPreset(candidate),
    [candidate],
  )

  const handlePresetClick = (preset: ReportingPeriodPreset) => {
    selection()

    const next = createReportingPeriodPresetSelection(preset)
    setCandidate(next)
    onChange(next)
  }

  const handleFromChange = (value: string) => {
    const nextFrom = parsePeriodDateInputValue(value)
    if (nextFrom == null) return

    const currentTo = candidate.dateTo - 1
    const nextTo = currentTo < nextFrom ? nextFrom : currentTo
    const next = createCustomPeriodSelection(nextFrom, nextTo)
    setCandidate(next)
    onChange(next)
  }

  const handleToChange = (value: string) => {
    const nextTo = parsePeriodDateInputValue(value)
    if (nextTo == null) return

    const currentFrom = candidate.dateFrom
    const nextFrom = nextTo < currentFrom ? nextTo : currentFrom
    const next = createCustomPeriodSelection(nextFrom, nextTo)
    setCandidate(next)
    onChange(next)
  }

  return (
    <section className='mt-6'>
      <h2 className='mb-3 text-base leading-tight font-semibold text-foreground'>
        {t('period.sectionTime')}
      </h2>
      <ToggleGroup
        className='flex w-full flex-wrap gap-2'
        spacing={0}
        value={activePreset ? [activePreset] : []}
        onValueChange={(values) => {
          const value = values[0]
          if (
            value &&
            REPORTING_PERIOD_PRESETS.includes(value as ReportingPeriodPreset)
          ) {
            handlePresetClick(value as ReportingPeriodPreset)
          }
        }}>
        {REPORTING_PERIOD_PRESETS.map((preset) => (
          <ToggleGroupItem
            key={preset}
            className='min-h-10 rounded-full border border-black/6 bg-white/75 pr-3 pl-2 text-sm shadow-sm data-[state=on]:border-primary data-[state=on]:bg-primary/12 data-[state=on]:text-primary'
            type='button'
            value={preset}>
            <CalendarIcon
              aria-hidden='true'
              className='size-4 text-neutral-700'
            />
            {getReportingPeriodPresetLabel(preset, t)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Card
        className={cn(
          'mt-3 grid gap-3 p-4',
          activePreset
            ? 'border-primary/30 bg-primary/[0.07]'
            : 'border-amber-400/35 bg-[#fff9e6]',
        )}>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant={activePreset ? 'default' : 'secondary'}>
            {activePreset
              ? getReportingPeriodPresetLabel(activePreset, t)
              : t('period.sectionCustom')}
          </Badge>
          {!activePreset && candidate.dateFrom > 0 && candidate.dateTo > 0 && (
            <span className='text-xs text-muted-foreground'>
              {formatPeriodSelectionRangeLabel(candidate)}
            </span>
          )}
        </div>
        <PeriodRangeTimeline
          candidate={candidate}
          t={t}
          onFromChange={handleFromChange}
          onToChange={handleToChange}
        />
      </Card>
    </section>
  )
}
