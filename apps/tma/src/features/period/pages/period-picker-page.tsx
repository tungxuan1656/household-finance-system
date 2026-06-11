import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { TmaPageHeader, TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardDescription,
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
      'min-h-10 rounded-full border px-3.5 text-sm font-bold transition active:scale-95',
      isActive
        ? 'border-tma-primary bg-tma-primary/12 text-tma-primary'
        : 'border-black/[0.06] bg-white/75 text-tma-text-strong shadow-tma-soft',
    )}
    type='button'
    onClick={onClick}>
    {getReportingPeriodPresetLabel(preset)}
  </button>
)

export const PeriodPickerPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
  const setSelectedPeriod = usePeriodStore((state) => state.setSelectedPeriod)

  const locationState = (location.state ??
    null) as PeriodPickerLocationState | null
  const isSubPage = !!locationState?.backTo
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

  return (
    <TmaPageShell reserveBottomButton title='Chọn kỳ'>
      <TmaPageHeader
        eyebrow='Kỳ báo cáo'
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
            <Field>
              <FieldLabel>Từ ngày</FieldLabel>
              <Input
                type='date'
                value={customFrom}
                onChange={(event) => {
                  const value = event.target.value
                  setCustomFrom(value)
                  updateCustomCandidate(value, customTo)
                }}
              />
            </Field>
            <Field>
              <FieldLabel>Đến ngày</FieldLabel>
              <Input
                type='date'
                value={customTo}
                onChange={(event) => {
                  const value = event.target.value
                  setCustomTo(value)
                  updateCustomCandidate(customFrom, value)
                }}
              />
            </Field>
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
          eyebrow='Đang chọn'
          title={formatPeriodSelectionLabel(candidate)}
        />
        <Card className='grid gap-2 p-4'>
          <Eyebrow>{formatPeriodSelectionRangeLabel(candidate)}</Eyebrow>
          <div className='grid gap-1 text-sm text-tma-text-strong'>
            <span>
              Từ:{' '}
              <strong>{formatPeriodSelectionDate(candidate.dateFrom)}</strong>
            </span>
            <span>
              Đến:{' '}
              <strong>{formatPeriodSelectionDate(candidate.dateTo - 1)}</strong>
            </span>
          </div>
        </Card>
      </Section>
    </TmaPageShell>
  )
}
