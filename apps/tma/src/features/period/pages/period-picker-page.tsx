import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { TmaPageHeader, TmaPageShell } from '@/components/shared/tma-page-shell'
import { Card, Eyebrow, Section, SectionHeader } from '@/components/ui'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  createMonthPeriodSelection,
  createWeekPeriodSelection,
  createYearPeriodSelection,
  formatPeriodSelectionDate,
  formatPeriodSelectionRangeLabel,
  getPeriodSelectionMonth,
  getPeriodSelectionWeek,
  getPeriodSelectionYear,
  getPeriodYears,
  getWeeksInYear,
  type PeriodGranularity,
} from '@/lib/period'
import {
  hideBottomButton,
  setBottomButton,
  updateBottomButton,
} from '@/lib/telegram/bottom-button'
import { selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

import { usePeriodStore } from '../store'

const periodTabs: Array<{ label: string; value: PeriodGranularity }> = [
  { label: 'Tuần', value: 'week' },
  { label: 'Tháng', value: 'month' },
  { label: 'Năm', value: 'year' },
]

const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1)

const PeriodOptionButton = ({
  description,
  isActive,
  label,
  onClick,
}: {
  description?: string
  isActive: boolean
  label: string
  onClick: () => void
}) => (
  <button
    className={cn(
      'grid justify-items-start gap-1 rounded-2xl bg-black/[0.04] px-3.5 py-3 text-left shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)] transition active:scale-[0.99]',
      isActive && 'bg-tma-primary/12 text-tma-primary',
    )}
    type='button'
    onClick={onClick}>
    <span className='font-semibold'>{label}</span>
    {description ? (
      <small className='text-xs text-tma-text-muted'>{description}</small>
    ) : null}
  </button>
)

export const PeriodPickerPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
  const setSelectedPeriod = usePeriodStore((state) => state.setSelectedPeriod)
  const [tab, setTab] = useState<PeriodGranularity>(selectedPeriod.granularity)
  const [activeYear, setActiveYear] = useState(
    getPeriodSelectionYear(selectedPeriod),
  )
  const [selectedMonth, setSelectedMonth] = useState(
    getPeriodSelectionMonth(selectedPeriod) ?? 1,
  )
  const [selectedWeek, setSelectedWeek] = useState(
    getPeriodSelectionWeek(selectedPeriod) ?? 1,
  )

  const years = useMemo(() => getPeriodYears(), [])

  useEffect(() => {
    setTab(selectedPeriod.granularity)
    setActiveYear(getPeriodSelectionYear(selectedPeriod))
    setSelectedMonth(getPeriodSelectionMonth(selectedPeriod) ?? 1)
    setSelectedWeek(getPeriodSelectionWeek(selectedPeriod) ?? 1)
  }, [selectedPeriod])

  const candidate = useMemo(() => {
    if (tab === 'year') {
      return createYearPeriodSelection(activeYear)
    }

    if (tab === 'week') {
      return createWeekPeriodSelection(
        activeYear,
        Math.min(selectedWeek, getWeeksInYear(activeYear)),
      )
    }

    return createMonthPeriodSelection(activeYear, selectedMonth)
  }, [activeYear, selectedMonth, selectedWeek, tab])

  const handleApply = useEffectEvent(() => {
    const backTo =
      (location.state as { backTo?: string } | null)?.backTo ?? TMA_PATHS.root

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
      text: `Chọn ${formatPeriodSelectionRangeLabel(candidate)}`,
      enabled: true,
      showProgress: false,
    })
  }, [candidate])

  return (
    <TmaPageShell reserveBottomButton title='Chọn kỳ'>
      <TmaPageHeader
        eyebrow='Analytics range'
        subtitle='Chọn preset tuần, tháng, hoặc năm. App sẽ lưu range tương ứng để Home và household đồng bộ.'
        title='Đổi kỳ xem dữ liệu'
      />

      <div className='grid grid-cols-3 gap-1.5 rounded-[18px] bg-white/65 p-1.5 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)]'>
        {periodTabs.map((periodTab) => (
          <button
            key={periodTab.value}
            className={cn(
              'min-h-9 rounded-[13px] px-2 text-xs font-bold text-tma-text-muted transition active:scale-95',
              tab === periodTab.value && 'bg-tma-primary/12 text-tma-primary',
            )}
            type='button'
            onClick={() => {
              selection()
              setTab(periodTab.value)
            }}>
            {periodTab.label}
          </button>
        ))}
      </div>

      <Section>
        <SectionHeader
          eyebrow='Preview'
          title={formatPeriodSelectionRangeLabel(candidate)}
        />
        <Card className='grid gap-2 p-4'>
          <Eyebrow>Giá trị lưu trong store/API</Eyebrow>
          <div className='grid gap-1 text-sm text-tma-text-strong'>
            <span>
              from:{' '}
              <strong>{formatPeriodSelectionDate(candidate.dateFrom)}</strong>
            </span>
            <span>
              to:{' '}
              <strong>{formatPeriodSelectionDate(candidate.dateTo - 1)}</strong>
            </span>
          </div>
        </Card>
      </Section>

      {tab === 'year' ? (
        <Section>
          <SectionHeader eyebrow='Năm' title='10 năm gần nhất' />
          <div className='grid gap-2.5'>
            {years.map((year) => (
              <PeriodOptionButton
                key={year}
                isActive={activeYear === year}
                label={String(year)}
                onClick={() => {
                  selection()
                  setActiveYear(year)
                }}
              />
            ))}
          </div>
        </Section>
      ) : (
        <Section>
          <SectionHeader
            eyebrow={tab === 'month' ? 'Tháng' : 'Tuần'}
            title='Chọn năm và giá trị tương ứng'
          />
          <div className='flex items-start gap-3'>
            <div
              className='grid max-h-[320px] w-[120px] gap-2.5 overflow-y-auto pr-1'
              data-testid='period-year-list'>
              {years.map((year) => (
                <PeriodOptionButton
                  key={year}
                  isActive={activeYear === year}
                  label={String(year)}
                  onClick={() => {
                    selection()
                    setActiveYear(year)
                    if (tab === 'week') {
                      setSelectedWeek((value) =>
                        Math.min(value, getWeeksInYear(year)),
                      )
                    }
                  }}
                />
              ))}
            </div>
            <div
              className='grid max-h-[440px] min-w-0 flex-1 gap-2.5 overflow-y-auto pr-1'
              data-testid='period-value-list'>
              {tab === 'month'
                ? monthOptions.map((month) => (
                    <PeriodOptionButton
                      key={month}
                      description={formatPeriodSelectionRangeLabel(
                        createMonthPeriodSelection(activeYear, month),
                      )}
                      isActive={selectedMonth === month}
                      label={`Tháng ${String(month).padStart(2, '0')}`}
                      onClick={() => {
                        selection()
                        setSelectedMonth(month)
                      }}
                    />
                  ))
                : Array.from(
                    { length: getWeeksInYear(activeYear) },
                    (_, index) => index + 1,
                  ).map((week) => (
                    <PeriodOptionButton
                      key={week}
                      description={formatPeriodSelectionRangeLabel(
                        createWeekPeriodSelection(activeYear, week),
                      )}
                      isActive={selectedWeek === week}
                      label={`Tuần ${week}`}
                      onClick={() => {
                        selection()
                        setSelectedWeek(week)
                      }}
                    />
                  ))}
            </div>
          </div>
        </Section>
      )}
    </TmaPageShell>
  )
}
