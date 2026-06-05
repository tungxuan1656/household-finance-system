import { useState } from 'react'

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
  Eyebrow,
  MoneyLabel,
  Section,
  SectionHeader,
  SegmentedControl,
} from '@/components/ui'
import { statisticMonths, statisticSlices } from '@/features/finance/mock-data'
import { formatMonthLabel, formatVnd } from '@/lib/formatters'
import { impact, selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

const rangeOptions = [
  { value: 'day', label: 'Ngày' },
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
  { value: 'year', label: 'Năm' },
] as const

const monthModifiers = [1, 0.92, 0.88]

const toneClassName = {
  muted: 'from-[#dfe7f7] to-[#c5d0e7]',
  positive: 'from-[#8ae293] to-tma-positive',
  primary: 'from-[#76a2ff] to-tma-primary',
  warning: 'from-[#ffe58a] to-tma-warning',
} as const

export const StatisticsPage = () => {
  const [monthIndex, setMonthIndex] = useState(0)
  const [range, setRange] =
    useState<(typeof rangeOptions)[number]['value']>('month')

  const slice = statisticSlices[range]
  const modifier = monthModifiers[monthIndex] ?? 1
  const total = Math.round(slice.total * modifier)

  return (
    <TmaPageShell title='Thống kê'>
      <Card className='relative mb-3 grid gap-3 overflow-hidden p-5 after:absolute after:-right-8 after:-bottom-20 after:size-56 after:rounded-full after:bg-tma-warning/25 after:content-[""]'>
        <div className='relative z-10'>
          <Eyebrow>Tổng chi</Eyebrow>
          <MoneyLabel className='mt-1 block text-[30px] leading-none font-extrabold'>
            {formatVnd(total)}
          </MoneyLabel>
          <CardDescription className='mt-2'>
            {slice.changeLabel}
          </CardDescription>
        </div>
        <Chip className='relative z-10 justify-self-start'>
          Điểm nổi bật: {slice.selectedCategory}
        </Chip>
      </Card>

      <Card className='mb-3 flex items-center justify-between gap-3 p-4'>
        <Button
          size='icon'
          variant='outline'
          onClick={() => {
            impact('light')
            setMonthIndex((i) => (i === 0 ? statisticMonths.length - 1 : i - 1))
          }}>
          <ChevronLeftIcon height='18' width='18' />
        </Button>

        <div className='text-center'>
          <Eyebrow>Chu kỳ đang xem</Eyebrow>
          <strong className='mt-0.5 block text-[17px] text-tma-text-strong'>
            {formatMonthLabel(statisticMonths[monthIndex])}
          </strong>
        </div>

        <Button
          size='icon'
          variant='outline'
          onClick={() => {
            impact('light')
            setMonthIndex((i) => (i + 1) % statisticMonths.length)
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
            <CardTitle>{slice.selectedCategory}</CardTitle>
          </div>
          <Chip tone='primary'>Mặc định: Tháng</Chip>
        </div>

        <div className='grid min-h-32 auto-cols-fr grid-flow-col items-end gap-2.5 pt-2'>
          {slice.chartBars.map((bar) => (
            <div key={bar.label} className='grid justify-items-center gap-2'>
              <div
                className={cn(
                  'min-h-3 w-full rounded-t-full rounded-b-2xl bg-gradient-to-b',
                  toneClassName[bar.tone],
                )}
                style={{ height: `${bar.amount * 2}px` }}
              />
              <span className='text-xs font-semibold text-tma-text-muted'>
                {bar.label}
              </span>
            </div>
          ))}
        </div>

        <div className='grid gap-2'>
          {slice.legends.map((legend) => (
            <div
              key={legend.label}
              className='flex items-center justify-between gap-3 rounded-2xl bg-black/[0.04] px-3.5 py-3 text-sm'>
              <span>{legend.label}</span>
              <MoneyLabel className='font-bold'>
                {formatVnd(legend.amount)}
              </MoneyLabel>
            </div>
          ))}
        </div>
      </Card>

      <Section>
        <SectionHeader eyebrow='Xếp hạng' title='Những phần chi nổi bật' />
        <Card className='grid gap-2'>
          {slice.ranking.map((entry) => (
            <article
              key={entry.label}
              className='flex items-start justify-between gap-3'>
              <div>
                <h3 className='m-0 text-[15px] font-semibold text-tma-text-strong'>
                  {entry.label}
                </h3>
                <CardDescription>{entry.percent}% tổng chi</CardDescription>
              </div>
              <MoneyLabel className='text-sm font-bold'>
                {formatVnd(entry.amount)}
              </MoneyLabel>
            </article>
          ))}
        </Card>
      </Section>
    </TmaPageShell>
  )
}
