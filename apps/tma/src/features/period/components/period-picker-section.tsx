import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/components/shared/date-picker'
import { CalendarIcon } from '@/components/shared/tma-icons'
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
    () => getMatchingReportingPeriodPreset(candidate),
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

  const hasValidCustomRange = candidate.dateFrom > 0 && candidate.dateTo > 0

  return (
    <section className='flex flex-col gap-3'>
      {/* Clear hierarchy: label + helper */}
      <div className='flex items-baseline justify-between gap-3 px-1'>
        <h2 className='text-sm font-semibold tracking-tight text-foreground'>
          {t('period.sectionTime')}
        </h2>
        <span className='text-xs font-medium text-muted-foreground'>
          {activePreset
            ? t('period.hintPreset', { defaultValue: 'Đã chọn nhanh' })
            : hasValidCustomRange
              ? t('period.hintCustom', { defaultValue: 'Tùy chỉnh' })
              : t('period.hintChoose', {
                  defaultValue: 'Chọn khoảng thời gian',
                })}
        </span>
      </div>

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
        {REPORTING_PERIOD_PRESETS.map((preset) => {
          return (
            <ToggleGroupItem
              key={preset}
              className={'bg-white'}
              size='sm'
              type='button'
              value={preset}
              variant='outline'>
              {getReportingPeriodPresetLabel(preset, t)}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>

      <Card className='overflow-hidden border shadow-sm'>
        <CardHeader className='gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge
              className={
                activePreset
                  ? 'inline-flex items-center gap-1.5 bg-primary px-3 py-1 text-xs font-semibold tracking-normal text-primary-foreground normal-case'
                  : 'inline-flex items-center gap-1.5 bg-muted px-3 py-1 text-xs font-semibold tracking-normal text-muted-foreground normal-case'
              }
              variant={activePreset ? 'default' : 'secondary'}>
              {activePreset ? (
                <>
                  <span
                    aria-hidden
                    className='size-2 rounded-full bg-primary-foreground'
                  />
                  {getReportingPeriodPresetLabel(activePreset, t)}
                </>
              ) : (
                <>
                  <CalendarIcon className='size-3.5' />
                  {t('period.sectionCustom')}
                </>
              )}
            </Badge>
          </div>
          {!activePreset && hasValidCustomRange ? (
            <CardDescription className='text-sm font-medium tracking-normal text-foreground tabular-nums'>
              {formatPeriodSelectionRangeLabel(candidate)}
            </CardDescription>
          ) : !activePreset ? (
            <CardDescription className='text-xs leading-relaxed'>
              {t('period.customHint', {
                defaultValue: 'Chọn ngày bắt đầu và kết thúc bên dưới',
              })}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          <FieldGroup className='gap-3'>
            <div className='grid grid-cols-[1fr_auto_1fr] items-end gap-2.5'>
              <Field className='gap-1.5'>
                <FieldLabel
                  className='text-xs font-medium tracking-normal text-foreground normal-case'
                  htmlFor='period-from-picker'>
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
                className='grid place-items-center pb-3 text-muted-foreground'>
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
              <Field className='gap-1.5'>
                <FieldLabel
                  className='text-xs font-medium tracking-normal text-foreground normal-case'
                  htmlFor='period-to-picker'>
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
