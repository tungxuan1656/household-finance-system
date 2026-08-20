import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/components/shared/date-picker'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
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

  useEffect(() => {
    if (value) {
      setCandidate(value)
    } else {
      setCandidate({ granularity: 'custom', dateFrom: 0, dateTo: 0 })
    }
  }, [value])

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
    <section className='flex flex-col gap-3'>
      <h2 className='text-sm font-semibold tracking-widest text-foreground uppercase'>
        {t('period.sectionTime')}
      </h2>
      <ToggleGroup
        className='flex w-full flex-wrap gap-2'
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
          <ToggleGroupItem key={preset} type='button' value={preset}>
            {getReportingPeriodPresetLabel(preset, t)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Card>
        <CardHeader>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant={activePreset ? 'default' : 'secondary'}>
              {activePreset
                ? getReportingPeriodPresetLabel(activePreset, t)
                : t('period.sectionCustom')}
            </Badge>
          </div>
          {!activePreset && candidate.dateFrom > 0 && candidate.dateTo > 0 && (
            <CardDescription>
              {formatPeriodSelectionRangeLabel(candidate)}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className='grid grid-cols-[1fr_auto_1fr] items-stretch gap-2.5'>
              <Field>
                <FieldLabel htmlFor='period-from-picker'>
                  {t('period.fieldFrom')}
                </FieldLabel>
                <DatePicker
                  fullWidth
                  aria-label={t('period.fieldFromPlaceholder')}
                  id='period-from-picker'
                  placeholder={t('period.fieldFrom')}
                  value={formatPeriodDateInputValue(candidate.dateFrom)}
                  onChange={handleFromChange}
                />
              </Field>
              <div
                aria-hidden='true'
                className='grid place-items-center pt-6 text-muted-foreground'>
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
              <Field>
                <FieldLabel htmlFor='period-to-picker'>
                  {t('period.fieldTo')}
                </FieldLabel>
                <DatePicker
                  fullWidth
                  aria-label={t('period.fieldToPlaceholder')}
                  id='period-to-picker'
                  placeholder={t('period.fieldTo')}
                  value={formatPeriodDateInputValue(candidate.dateTo - 1)}
                  onChange={handleToChange}
                />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </section>
  )
}
