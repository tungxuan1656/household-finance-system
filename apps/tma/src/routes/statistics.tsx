import { useMemo, useState } from 'react'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/components/shared/tma-icons'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Chip,
  DataState,
  Eyebrow,
  MoneyLabel,
  Section,
  SectionHeader,
  SegmentedControl,
} from '@/components/ui'
import {
  useAnalyticsComparisonQuery,
  useAnalyticsOverviewQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
  getComparisonLabel,
} from '@/features/home/presentation'
import type { AnalyticsOverviewDTO } from '@/features/home/types'
import {
  formatDateLabel,
  formatMonthLabel,
  formatPeriodLabel,
} from '@/lib/formatters'
import { getCurrentPeriod } from '@/lib/period'
import { impact, selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

const rangeOptions = [
  { value: 'day', label: 'Ngày' },
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
  { value: 'year', label: 'Năm' },
] as const

type StatisticRange = (typeof rangeOptions)[number]['value']

const toneClassNames = [
  'from-[#76a2ff] to-tma-primary',
  'from-[#8ae293] to-tma-positive',
  'from-[#dfe7f7] to-[#c5d0e7]',
  'from-[#ffe58a] to-tma-warning',
] as const

const toPeriodDate = (period: string) => new Date(`${period}-01T00:00:00+07:00`)

const toPeriod = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const shiftPeriod = (period: string, months: number): string => {
  const date = toPeriodDate(period)
  date.setMonth(date.getMonth() + months)

  return toPeriod(date)
}

const sameDateKey = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

const getDailySpendRows = (
  overview: AnalyticsOverviewDTO,
): Array<{ date: Date; totalSpendMinor: number }> =>
  overview.dailySpend
    .map((item) => ({
      date: new Date(item.date),
      totalSpendMinor: item.totalSpendMinor,
    }))
    .sort((left, right) => left.date.getTime() - right.date.getTime())

const getRangeRows = (
  overview: AnalyticsOverviewDTO,
  range: StatisticRange,
): Array<{ date: Date; totalSpendMinor: number }> => {
  const rows = getDailySpendRows(overview)

  if (range === 'week') {
    return rows.slice(-7)
  }

  if (range === 'day') {
    const periodDate = toPeriodDate(overview.period)
    const today = new Date()
    const selectedDate =
      today.getFullYear() === periodDate.getFullYear() &&
      today.getMonth() === periodDate.getMonth()
        ? today
        : rows.at(-1)?.date

    return selectedDate
      ? rows.filter((row) => sameDateKey(row.date, selectedDate))
      : []
  }

  return rows
}

const getRangeTotalMinor = (
  overview: AnalyticsOverviewDTO,
  range: StatisticRange,
): number => {
  if (range === 'month' || range === 'year') {
    return overview.totalSpendMinor
  }

  return getRangeRows(overview, range).reduce(
    (total, row) => total + row.totalSpendMinor,
    0,
  )
}

const getChartBars = (
  overview: AnalyticsOverviewDTO,
  range: StatisticRange,
): Array<{ label: string; totalSpendMinor: number }> => {
  const rows = getRangeRows(overview, range)

  if (range === 'month' || range === 'year') {
    const buckets = new Map<string, number>()

    for (const row of rows) {
      const weekNumber = Math.ceil(row.date.getDate() / 7)
      const label = `Tuần ${weekNumber}`
      buckets.set(label, (buckets.get(label) ?? 0) + row.totalSpendMinor)
    }

    return [...buckets.entries()].map(([label, totalSpendMinor]) => ({
      label,
      totalSpendMinor,
    }))
  }

  return rows.map((row) => ({
    label:
      range === 'day'
        ? formatDateLabel(row.date.toISOString())
        : `${row.date.getDate()}/${row.date.getMonth() + 1}`,
    totalSpendMinor: row.totalSpendMinor,
  }))
}

const getRangeDescription = (range: StatisticRange): string => {
  if (range === 'day') return 'Chi tiêu trong ngày đang có dữ liệu gần nhất.'
  if (range === 'week')
    return '7 ngày có dữ liệu gần nhất trong tháng đang xem.'
  if (range === 'year') return 'API hiện trả dữ liệu theo tháng đang xem.'

  return 'Toàn bộ tháng đang xem.'
}

export const StatisticsPage = () => {
  const [period, setPeriod] = useState(getCurrentPeriod())
  const [range, setRange] = useState<StatisticRange>('month')
  const overviewQuery = useAnalyticsOverviewQuery({ period })
  const comparisonQuery = useAnalyticsComparisonQuery({ period })
  const categoriesQuery = useReferenceCategoriesQuery()
  const overview = overviewQuery.data
  const totalMinor = overview ? getRangeTotalMinor(overview, range) : 0
  const chartBars = overview ? getChartBars(overview, range) : []
  const maxBarMinor = Math.max(
    ...chartBars.map((bar) => bar.totalSpendMinor),
    1,
  )

  const topCategories = useMemo(
    () => overview?.topCategories.slice(0, 4) ?? [],
    [overview?.topCategories],
  )

  return (
    <TmaPageShell title='Thống kê'>
      <DataState
        emptyDescription='Kỳ đang xem chưa có khoản chi nào để tổng hợp.'
        emptyTitle='Chưa có dữ liệu thống kê'
        errorDescription='Không tải được analytics thật từ API. Kiểm tra kết nối rồi thử lại.'
        errorTitle='Không tải được thống kê'
        isEmpty={
          !overviewQuery.isLoading &&
          !overviewQuery.isError &&
          Boolean(overview) &&
          overview?.expenseCount === 0
        }
        isError={overviewQuery.isError && !overview}
        isLoading={overviewQuery.isLoading && !overview}
        loadingDescription='Đang đọc analytics theo kỳ đang chọn.'
        loadingTitle='Đang tải thống kê'
        retryAction={overviewQuery.refetch}>
        {overview ? (
          <>
            <Card className='relative mb-3 grid gap-3 overflow-hidden p-5 after:absolute after:-right-8 after:-bottom-20 after:size-56 after:rounded-full after:bg-tma-warning/25 after:content-[""]'>
              <div className='relative z-10'>
                <Eyebrow>Tổng chi</Eyebrow>
                <MoneyLabel className='mt-1 block text-[30px] leading-none font-extrabold'>
                  {formatCurrencyMinor(totalMinor, overview.currencyCode)}
                </MoneyLabel>
                <CardDescription className='mt-2'>
                  {range === 'month'
                    ? getComparisonLabel(
                        comparisonQuery.data,
                        overview.expenseCount,
                      )
                    : getRangeDescription(range)}
                </CardDescription>
              </div>
              <Chip className='relative z-10 justify-self-start'>
                Dữ liệu thật: {formatPeriodLabel(overview.period)}
              </Chip>
            </Card>

            <Card className='mb-3 flex items-center justify-between gap-3 p-4'>
              <Button
                size='icon'
                variant='outline'
                onClick={() => {
                  impact('light')
                  setPeriod((value) => shiftPeriod(value, -1))
                }}>
                <ChevronLeftIcon height='18' width='18' />
              </Button>

              <div className='text-center'>
                <Eyebrow>Chu kỳ đang xem</Eyebrow>
                <strong className='mt-0.5 block text-[17px] text-tma-text-strong'>
                  {formatMonthLabel(toPeriodDate(period))}
                </strong>
              </div>

              <Button
                size='icon'
                variant='outline'
                onClick={() => {
                  impact('light')
                  setPeriod((value) => shiftPeriod(value, 1))
                }}>
                <ChevronRightIcon height='18' width='18' />
              </Button>
            </Card>

            <SegmentedControl
              options={[...rangeOptions]}
              value={range}
              onChange={(value) => {
                selection()
                setRange(value)
              }}
            />

            <Card className='mt-3 grid gap-4'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <Eyebrow>Biểu đồ chính</Eyebrow>
                  <CardTitle>{getRangeDescription(range)}</CardTitle>
                </div>
                <Chip tone='primary'>
                  {overviewQuery.isFetching ? 'Đang cập nhật' : 'Live API'}
                </Chip>
              </div>

              {chartBars.length > 0 ? (
                <div className='grid min-h-32 auto-cols-fr grid-flow-col items-end gap-2.5 pt-2'>
                  {chartBars.map((bar, index) => (
                    <div
                      key={bar.label}
                      className='grid justify-items-center gap-2'>
                      <div
                        className={cn(
                          'min-h-3 w-full rounded-t-full rounded-b-2xl bg-gradient-to-b',
                          toneClassNames[index % toneClassNames.length],
                        )}
                        style={{
                          height: `${Math.max(
                            (bar.totalSpendMinor / maxBarMinor) * 120,
                            12,
                          )}px`,
                        }}
                      />
                      <span className='text-xs font-semibold text-tma-text-muted'>
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <CardDescription>Chưa có dữ liệu biểu đồ.</CardDescription>
              )}

              <div className='grid gap-2'>
                {topCategories.map((category) => {
                  const presentation = getCategoryPresentation(
                    category.categoryKey,
                    categoriesQuery.data?.items,
                  )

                  return (
                    <div
                      key={category.categoryKey}
                      className='flex items-center justify-between gap-3 rounded-2xl bg-black/[0.04] px-3.5 py-3 text-sm'>
                      <span>{presentation.label}</span>
                      <MoneyLabel className='font-bold'>
                        {formatCurrencyMinor(
                          category.totalSpendMinor,
                          overview.currencyCode,
                        )}
                      </MoneyLabel>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Section>
              <SectionHeader
                eyebrow='Xếp hạng'
                title='Những phần chi nổi bật'
              />
              <Card className='grid gap-2'>
                {topCategories.length > 0 ? (
                  topCategories.map((entry) => {
                    const presentation = getCategoryPresentation(
                      entry.categoryKey,
                      categoriesQuery.data?.items,
                    )

                    return (
                      <article
                        key={entry.categoryKey}
                        className='flex items-start justify-between gap-3'>
                        <div>
                          <h3 className='m-0 text-[15px] font-semibold text-tma-text-strong'>
                            {presentation.label}
                          </h3>
                          <CardDescription>
                            {entry.percentOfTotal}% tổng chi
                          </CardDescription>
                        </div>
                        <MoneyLabel className='text-sm font-bold'>
                          {formatCurrencyMinor(
                            entry.totalSpendMinor,
                            overview.currencyCode,
                          )}
                        </MoneyLabel>
                      </article>
                    )
                  })
                ) : (
                  <CardDescription>
                    Chưa có category đủ lớn để xếp hạng.
                  </CardDescription>
                )}
              </Card>
            </Section>
          </>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
