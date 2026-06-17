import { useMemo, useState } from 'react'

import { CalendarIcon } from '@/components/shared/tma-icons'
import { Card, Chip, DatePicker, Section, SectionHeader } from '@/components/ui'
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

const PeriodPresetButton = ({
  isActive,
  onClick,
  preset,
}: {
  isActive: boolean
  onClick: () => void
  preset: ReportingPeriodPreset
}) => (
  <button
    aria-pressed={isActive}
    className={cn(
      'inline-flex min-h-10 items-center gap-1 rounded-full border pr-3 pl-2 text-sm font-medium transition active:scale-95',
      isActive
        ? 'border-tma-primary bg-tma-primary/12 text-tma-primary shadow-[inset_0_0_0_1px_rgba(63,124,255,0.12)]'
        : 'border-black/6 bg-white/75 text-tma-text-strong shadow-tma-soft',
    )}
    type='button'
    onClick={onClick}>
    <CalendarIcon aria-hidden='true' className='size-4 text-neutral-700' />
    {getReportingPeriodPresetLabel(preset)}
  </button>
)

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
}: {
  candidate: PeriodSelection
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}) => (
  <div className='grid grid-cols-[1fr_auto_1fr] items-stretch gap-2.5'>
    <PeriodTimelineDateButton
      inputLabel='Chọn từ ngày'
      inputValue={formatPeriodDateInputValue(candidate.dateFrom)}
      label='Từ ngày'
      onChange={onFromChange}
    />
    <div
      aria-hidden='true'
      className='grid place-items-center text-tma-text-muted'>
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
      inputLabel='Chọn đến ngày'
      inputValue={formatPeriodDateInputValue(candidate.dateTo - 1)}
      label='Đến ngày'
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
    <Section>
      <SectionHeader title='Thởi gian' />
      <div className='flex flex-wrap gap-2'>
        {REPORTING_PERIOD_PRESETS.map((preset) => (
          <PeriodPresetButton
            key={preset}
            isActive={activePreset === preset}
            preset={preset}
            onClick={() => handlePresetClick(preset)}
          />
        ))}
      </div>

      <Card
        className={cn(
          'mt-3 grid gap-3',
          activePreset
            ? 'border-tma-primary/30 bg-tma-primary/[0.07]'
            : 'border-tma-warning/35 bg-[#fff9e6]',
        )}>
        <div className='flex flex-wrap items-center gap-2'>
          <Chip tone={activePreset ? 'primary' : 'warning'}>
            {activePreset
              ? getReportingPeriodPresetLabel(activePreset)
              : 'Tùy chỉnh'}
          </Chip>
          {!activePreset && candidate.dateFrom > 0 && candidate.dateTo > 0 && (
            <span className='text-xs text-tma-text-muted'>
              {formatPeriodSelectionRangeLabel(candidate)}
            </span>
          )}
        </div>
        <PeriodRangeTimeline
          candidate={candidate}
          onFromChange={handleFromChange}
          onToChange={handleToChange}
        />
      </Card>
    </Section>
  )
}
