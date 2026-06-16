import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { CalendarIcon } from '@/components/shared/tma-icons'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  Chip,
  Eyebrow,
  Section,
  SectionHeader,
} from '@/components/ui'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  createCustomPeriodSelection,
  createReportingPeriodPresetSelection,
  formatPeriodDateInputValue,
  formatPeriodSelectionDate,
  formatPeriodSelectionLabel,
  getMatchingReportingPeriodPreset,
  getReportingPeriodPresetLabel,
  parsePeriodDateInputValue,
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

import { usePeriodStore } from '../store'

interface PeriodPickerLocationState {
  backTo?: string
  initialPeriod?: PeriodSelection | null
}

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
  displayValue,
  inputLabel,
  label,
  onChange,
  inputValue,
}: {
  displayValue: string
  inputLabel: string
  label: string
  onChange: (value: string) => void
  inputValue: string
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const openDatePicker = () => {
    impact('light')

    const input = inputRef.current

    if (!input) {
      return
    }

    if (input.showPicker) {
      input.showPicker()
    } else {
      input.click()
    }

    input.focus()
  }

  return (
    <div className='relative overflow-hidden rounded-[18px]'>
      <Button
        aria-label={inputLabel}
        className='grid h-full w-full justify-start gap-1 rounded-[18px] border-0 bg-white/80 p-3 text-left text-tma-text-strong shadow-none ring-1 ring-tma-line active:scale-[0.98]'
        variant='outline'
        onClick={openDatePicker}>
        <Eyebrow>{label}</Eyebrow>
        <span className='font-mono text-sm font-bold [font-variant-numeric:tabular-nums]'>
          {displayValue}
        </span>
      </Button>
      <input
        ref={inputRef}
        aria-label={inputLabel}
        className='pointer-events-none absolute inset-0 h-full w-full opacity-0'
        tabIndex={-1}
        type='date'
        value={inputValue}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

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
      displayValue={formatPeriodSelectionDate(candidate.dateFrom)}
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
      displayValue={formatPeriodSelectionDate(candidate.dateTo - 1)}
      inputLabel='Chọn đến ngày'
      inputValue={formatPeriodDateInputValue(candidate.dateTo - 1)}
      label='Đến ngày'
      onChange={onToChange}
    />
  </div>
)

export const PeriodPickerPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
  const setSelectedPeriod = usePeriodStore((state) => state.setSelectedPeriod)

  const locationState = (location.state ??
    null) as PeriodPickerLocationState | null
  const isSubPage = locationState?.initialPeriod !== undefined
  const initialPeriodFromState = locationState?.initialPeriod
  const initialPeriod =
    initialPeriodFromState !== undefined && initialPeriodFromState !== null
      ? initialPeriodFromState
      : selectedPeriod

  const [candidate, setCandidate] = useState<PeriodSelection>(initialPeriod)

  useEffect(() => {
    if (isSubPage) {
      return
    }

    setCandidate(selectedPeriod)
  }, [selectedPeriod, isSubPage])

  const activePreset = useMemo(
    () =>
      candidate.granularity === 'custom'
        ? null
        : getMatchingReportingPeriodPreset(candidate),
    [candidate],
  )

  const handleFromChange = (value: string) => {
    const nextFrom = parsePeriodDateInputValue(value)

    if (nextFrom == null) {
      return
    }

    const currentTo = candidate.dateTo - 1
    const nextTo = currentTo < nextFrom ? nextFrom : currentTo

    setCandidate(createCustomPeriodSelection(nextFrom, nextTo))
  }

  const handleToChange = (value: string) => {
    const nextTo = parsePeriodDateInputValue(value)

    if (nextTo == null) {
      return
    }

    const currentFrom = candidate.dateFrom
    const nextFrom = nextTo < currentFrom ? nextTo : currentFrom

    setCandidate(createCustomPeriodSelection(nextFrom, nextTo))
  }

  const handleApply = useEffectEvent(() => {
    const backTo = locationState?.backTo ?? TMA_PATHS.root

    if (isSubPage) {
      navigate(backTo, {
        replace: true,
        state: {
          ...(locationState ?? {}),
          appliedPeriod: candidate,
        },
      })

      return
    }

    setSelectedPeriod(candidate)

    if ((window.history.state as { idx?: number } | null)?.idx) {
      navigate(-1)

      return
    }

    navigate(backTo, { replace: true })
  })

  useEffect(() => {
    const cleanup = setBottomButton({
      text: 'Chọn',
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
      text: 'Chọn',
      enabled: true,
      showProgress: false,
    })
  }, [candidate])

  return (
    <TmaPageShell reserveBottomButton title='Chọn kỳ'>
      <Section className='mt-0'>
        <SectionHeader title='Chọn nhanh' />
        <div className='flex flex-wrap gap-2'>
          {REPORTING_PERIOD_PRESETS.map((preset) => (
            <PeriodPresetButton
              key={preset}
              isActive={activePreset === preset}
              preset={preset}
              onClick={() => {
                selection()

                const next = createReportingPeriodPresetSelection(preset)
                setCandidate(next)
              }}
            />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          title={
            activePreset ? formatPeriodSelectionLabel(candidate) : 'Tùy chỉnh'
          }
        />
        <Card
          className={cn(
            'grid gap-3',
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
          </div>
          <PeriodRangeTimeline
            candidate={candidate}
            onFromChange={handleFromChange}
            onToChange={handleToChange}
          />
        </Card>
      </Section>
    </TmaPageShell>
  )
}
