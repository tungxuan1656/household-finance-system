import { useState } from 'react'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/components/shared/tma-icons'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { statisticMonths, statisticSlices } from '@/features/finance/mock-data'
import { formatMonthLabel, formatVnd } from '@/lib/formatters'
import { impact, selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

const rangeOptions = [
  { id: 'day', label: 'Ngày' },
  { id: 'week', label: 'Tuần' },
  { id: 'month', label: 'Tháng' },
  { id: 'year', label: 'Năm' },
] as const

const monthModifiers = [1, 0.92, 0.88]

export const StatisticsPage = () => {
  const [monthIndex, setMonthIndex] = useState(0)
  const [range, setRange] =
    useState<(typeof rangeOptions)[number]['id']>('month')

  const slice = statisticSlices[range]
  const modifier = monthModifiers[monthIndex] ?? 1
  const total = Math.round(slice.total * modifier)

  return (
    <TmaPageShell title='Thống kê'>
      <section className='tma-hero-card'>
        <div>
          <p className='tma-section-label'>Tổng chi</p>
          <strong className='font-mono'>{formatVnd(total)}</strong>
          <p>{slice.changeLabel}</p>
        </div>

        <span className='tma-soft-pill'>
          Điểm nổi bật: {slice.selectedCategory}
        </span>
      </section>

      <section className='tma-month-switcher'>
        <button
          className='tma-icon-button'
          type='button'
          onClick={() => {
            impact('light')
            setMonthIndex((i) => (i === 0 ? statisticMonths.length - 1 : i - 1))
          }}>
          <ChevronLeftIcon height='18' width='18' />
        </button>

        <div>
          <p className='tma-section-label'>Chu kỳ đang xem</p>
          <strong>{formatMonthLabel(statisticMonths[monthIndex])}</strong>
        </div>

        <button
          className='tma-icon-button'
          type='button'
          onClick={() => {
            impact('light')
            setMonthIndex((i) => (i + 1) % statisticMonths.length)
          }}>
          <ChevronRightIcon height='18' width='18' />
        </button>
      </section>

      <section className='tma-segmented'>
        {rangeOptions.map((option) => (
          <button
            key={option.id}
            className={cn(
              'tma-segmented__item',
              range === option.id && 'bg-tma-primary/12 text-tma-primary',
            )}
            type='button'
            onClick={() => {
              selection()
              setRange(option.id)
            }}>
            {option.label}
          </button>
        ))}
      </section>

      <section className='tma-chart-card'>
        <div className='tma-chart-card__header'>
          <div>
            <p className='tma-section-label'>Biểu đồ chính</p>
            <h2>{slice.selectedCategory}</h2>
          </div>
          <span className='tma-status-pill'>Mặc định: Tháng</span>
        </div>

        <div className='tma-chart-card__bars'>
          {slice.chartBars.map((bar) => (
            <div key={bar.label} className='tma-chart-bar'>
              <div
                className={`tma-chart-bar__value tone-${bar.tone}`}
                style={{ height: `${bar.amount * 2}px` }}
              />
              <span>{bar.label}</span>
            </div>
          ))}
        </div>

        <div className='tma-legend-grid'>
          {slice.legends.map((legend) => (
            <div
              key={legend.label}
              className={`tma-legend-pill tone-${legend.tone}`}>
              <span>{legend.label}</span>
              <strong className='font-mono'>{formatVnd(legend.amount)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Xếp hạng</p>
            <h2 className='tma-section__title'>Những phần chi nổi bật</h2>
          </div>
        </div>

        <div className='tma-list-card'>
          {slice.ranking.map((entry) => (
            <article key={entry.label} className='tma-ranking-row'>
              <div>
                <h3>{entry.label}</h3>
                <p>{entry.percent}% tổng chi</p>
              </div>
              <strong className='font-mono'>{formatVnd(entry.amount)}</strong>
            </article>
          ))}
        </div>
      </section>
    </TmaPageShell>
  )
}
