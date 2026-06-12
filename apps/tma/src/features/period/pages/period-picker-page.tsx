import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { CalendarIcon, RefreshIcon } from '@/components/shared/tma-icons'
import { TmaPageHeader, TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardDescription,
  Chip,
  Eyebrow,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Section,
  SectionHeader,
} from '@/components/ui'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  createCurrentMonthPeriodSelection,
  createCustomPeriodSelection,
  createReportingPeriodPresetSelection,
  formatPeriodDateInputValue,
  formatPeriodSelectionDate,
  formatPeriodSelectionLabel,
  formatPeriodSelectionRangeLabel,
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
import { selection } from '@/lib/telegram/haptics'
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
      'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-bold transition active:scale-95',
      isActive
        ? 'border-tma-primary bg-tma-primary/12 text-tma-primary shadow-[inset_0_0_0_1px_rgba(63,124,255,0.12)]'
        : 'border-black/6 bg-white/75 text-tma-text-strong shadow-tma-soft',
    )}
    type='button'
    onClick={onClick}>
    <CalendarIcon
      aria-hidden='true'
      className='size-3.5'
      height='14'
      width='14'
    />
    {getReportingPeriodPresetLabel(preset)}
  </button>
)

const PeriodDateField = ({
  hasError,
  label,
  onChange,
  value,
}: {
  hasError: boolean
  label: string
  onChange: (value: string) => void
  value: string
}) => (
  <Field>
    <FieldLabel>{label}</FieldLabel>
    <div
      className={cn(
        'relative flex items-center rounded-[18px] border bg-black/[0.04] transition focus-within:border-tma-primary/30 focus-within:ring-4 focus-within:ring-tma-primary/10',
        hasError
          ? 'border-[#d93838]/40 focus-within:border-[#d93838]/60 focus-within:ring-[#d93838]/15'
          : 'border-tma-line',
      )}>
      <span
        aria-hidden='true'
        className='pointer-events-none absolute top-1/2 left-3.5 grid size-5 -translate-y-1/2 place-items-center text-tma-text-muted'>
        <CalendarIcon height='14' width='14' />
      </span>
      <Input
        className='border-0 bg-transparent pl-10 shadow-none focus:border-0 focus:ring-0'
        type='date'
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </Field>
)

const PeriodRangeTimeline = ({ candidate }: { candidate: PeriodSelection }) => (
  <div className='grid grid-cols-[1fr_auto_1fr] items-stretch gap-2.5'>
    <div className='grid gap-1 rounded-[18px] bg-white/80 p-3 ring-1 ring-tma-line'>
      <Eyebrow>Từ ngày</Eyebrow>
      <span className='font-mono text-sm font-bold text-tma-text-strong [font-variant-numeric:tabular-nums]'>
        {formatPeriodSelectionDate(candidate.dateFrom)}
      </span>
    </div>
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
    <div className='grid gap-1 rounded-[18px] bg-white/80 p-3 ring-1 ring-tma-line'>
      <Eyebrow>Đến ngày</Eyebrow>
      <span className='font-mono text-sm font-bold text-tma-text-strong [font-variant-numeric:tabular-nums]'>
        {formatPeriodSelectionDate(candidate.dateTo - 1)}
      </span>
    </div>
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
  const [customFrom, setCustomFrom] = useState(
    formatPeriodDateInputValue(initialPeriod.dateFrom),
  )
  const [customTo, setCustomTo] = useState(
    formatPeriodDateInputValue(initialPeriod.dateTo - 1),
  )

  useEffect(() => {
    if (isSubPage) {
      return
    }

    setCandidate(selectedPeriod)
    setCustomFrom(formatPeriodDateInputValue(selectedPeriod.dateFrom))
    setCustomTo(formatPeriodDateInputValue(selectedPeriod.dateTo - 1))
  }, [selectedPeriod, isSubPage])

  const activePreset = useMemo(
    () => getMatchingReportingPeriodPreset(candidate),
    [candidate],
  )
  const customFromTimestamp = parsePeriodDateInputValue(customFrom)
  const customToTimestamp = parsePeriodDateInputValue(customTo)
  const customError =
    customFromTimestamp == null || customToTimestamp == null
      ? 'Chọn đủ ngày bắt đầu và ngày kết thúc.'
      : customToTimestamp < customFromTimestamp
        ? 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.'
        : null

  const updateCustomCandidate = (fromValue: string, toValue: string) => {
    const from = parsePeriodDateInputValue(fromValue)
    const to = parsePeriodDateInputValue(toValue)

    if (from != null && to != null && to >= from) {
      setCandidate(createCustomPeriodSelection(from, to))
    }
  }

  const handleApply = useEffectEvent(() => {
    if (customError) {
      return
    }

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

  const handleResetToCurrentMonth = useEffectEvent(() => {
    selection()

    const now = createCurrentMonthPeriodSelection()
    setCandidate(now)
    setCustomFrom(formatPeriodDateInputValue(now.dateFrom))
    setCustomTo(formatPeriodDateInputValue(now.dateTo - 1))
  })

  useEffect(() => {
    const cleanup = setBottomButton({
      text: `Chọn ${formatPeriodSelectionRangeLabel(candidate)}`,
      enabled: customError == null,
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
      text: `Chọn ${formatPeriodSelectionRangeLabel(candidate)}`,
      enabled: customError == null,
      showProgress: false,
    })
  }, [candidate, customError])

  const showReset = !isSubPage

  return (
    <TmaPageShell reserveBottomButton title='Chọn kỳ'>
      <TmaPageHeader
        eyebrow='Kỳ báo cáo'
        leading={<CalendarIcon aria-hidden='true' height='22' width='22' />}
        subtitle='Chọn nhanh một khoảng thời gian hoặc tự nhập từ ngày đến ngày.'
        title='Đổi kỳ xem dữ liệu'
      />

      <Section className='mt-0'>
        <SectionHeader eyebrow='Chọn nhanh' title='Khoảng thời gian' />
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
                setCustomFrom(formatPeriodDateInputValue(next.dateFrom))
                setCustomTo(formatPeriodDateInputValue(next.dateTo - 1))
              }}
            />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow='Tùy chỉnh' title='Từ ngày -> đến ngày' />
        <Card className='grid gap-3'>
          <div className='grid grid-cols-2 gap-2.5'>
            <PeriodDateField
              hasError={Boolean(customError)}
              label='Từ ngày'
              value={customFrom}
              onChange={(value) => {
                setCustomFrom(value)
                updateCustomCandidate(value, customTo)
              }}
            />
            <PeriodDateField
              hasError={Boolean(customError)}
              label='Đến ngày'
              value={customTo}
              onChange={(value) => {
                setCustomTo(value)
                updateCustomCandidate(customFrom, value)
              }}
            />
          </div>
          {customError ? <FieldError>{customError}</FieldError> : null}
          <CardDescription>
            Khi chọn ngày hợp lệ, kỳ tùy chỉnh sẽ được áp dụng sau khi bấm nút
            xác nhận.
          </CardDescription>
        </Card>
      </Section>

      <Section>
        <SectionHeader
          action={
            showReset ? (
              <button
                aria-label='Đặt lại về tháng này'
                className='inline-flex shrink-0 items-center gap-1 rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-bold text-tma-text-strong transition active:scale-95'
                type='button'
                onClick={handleResetToCurrentMonth}>
                <RefreshIcon aria-hidden='true' height='12' width='12' />
                Tháng này
              </button>
            ) : null
          }
          eyebrow='Đang chọn'
          title={formatPeriodSelectionLabel(candidate)}
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
            <span className='text-xs text-tma-text-muted'>
              {activePreset
                ? 'Áp dụng nhanh theo preset'
                : 'Khoảng thời gian riêng'}
            </span>
          </div>
          <PeriodRangeTimeline candidate={candidate} />
        </Card>
      </Section>
    </TmaPageShell>
  )
}
