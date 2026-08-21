import { useTranslation } from 'react-i18next'

import { QueryState } from '@/components/shared/query-state'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useReferenceCategoriesQuery } from '@/features/home/api'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
} from '@/features/home/presentation'
import type { AnalyticsOverviewDTO } from '@/features/home/types'

const chartColors = ['#3f7cff', '#5dd36d', '#ffd84d', '#ff8a3d', '#c5d0e7']

const getPieBackground = (
  categories: AnalyticsOverviewDTO['topCategories'],
): string => {
  if (categories.length === 0) {
    return 'conic-gradient(rgba(17,24,39,0.08) 0deg 360deg)'
  }

  let cursor = 0
  const segments = categories.map((category, index) => {
    const start = cursor
    const degrees = Math.max(0, (category.percentOfTotal / 100) * 360)
    cursor += degrees

    return `${chartColors[index % chartColors.length]} ${start}deg ${cursor}deg`
  })

  if (cursor < 360) {
    segments.push(`rgba(17,24,39,0.06) ${cursor}deg 360deg`)
  }

  return `conic-gradient(${segments.join(', ')})`
}

const getLegendPercent = (
  category: AnalyticsOverviewDTO['topCategories'][number],
  totalSpendMinor: number,
): number => {
  if (totalSpendMinor <= 0) {
    return 0
  }

  return Math.round((category.totalSpendMinor / totalSpendMinor) * 100)
}

interface CategoryBreakdownCardProps {
  overview: AnalyticsOverviewDTO
}

export const CategoryBreakdownCard = ({
  overview,
}: CategoryBreakdownCardProps) => {
  const { t } = useTranslation()
  const categoriesQuery = useReferenceCategoriesQuery()
  const topCategories = overview.topCategories.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('statistics.eyebrowCategoryBreakdown')}</CardTitle>
        <CardDescription>
          {formatCurrencyMinor(overview.totalSpendMinor, overview.currencyCode)}
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-5'>
        <div className='grid justify-items-center gap-4'>
          <div
            aria-label={t('statistics.chartAria')}
            className='relative grid size-44 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7),0_18px_34px_rgba(17,24,39,0.08)]'
            role='img'
            style={{ background: getPieBackground(topCategories) }}>
            <div className='grid size-24 place-items-center rounded-full bg-white/95 text-center shadow-sm'>
              <div>
                <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
                  {t('statistics.total')}
                </p>
                <span className='block font-mono text-sm font-extrabold text-foreground [font-variant-numeric:tabular-nums]'>
                  {formatCurrencyMinor(
                    overview.totalSpendMinor,
                    overview.currencyCode,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <QueryState
          error={{
            title: t('statistics.loadError'),
            description: t('statistics.loadErrorDesc'),
          }}
          pending={{
            title: t('statistics.loadingTitle'),
            description: t('statistics.loadingDesc'),
          }}
          query={categoriesQuery}
          variant='plain'>
          {(categoriesData) => {
            const items = categoriesData.items

            if (topCategories.length === 0) {
              return (
                <CardDescription>
                  {t('statistics.categoryRankingEmpty')}
                </CardDescription>
              )
            }

            return (
              <div className='grid gap-2'>
                {topCategories.map((category, index) => {
                  const presentation = getCategoryPresentation(
                    category.categoryKey,
                    t,
                    items,
                  )
                  const percent = getLegendPercent(
                    category,
                    overview.totalSpendMinor,
                  )

                  return (
                    <article
                      key={category.categoryKey}
                      className='flex items-center justify-between gap-3 rounded-2xl bg-black/4 px-3.5 py-3'>
                      <div className='flex min-w-0 items-center gap-3'>
                        <span
                          className='size-3 shrink-0 rounded-full'
                          style={{
                            background: chartColors[index % chartColors.length],
                          }}
                        />
                        <div className='min-w-0'>
                          <h3 className='m-0 truncate text-sm font-bold text-foreground'>
                            {presentation.label}
                          </h3>
                          <CardDescription>
                            {t('statistics.expenseCount', {
                              count: category.expenseCount,
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      <div className='shrink-0 text-right'>
                        <span className='block font-mono text-sm font-bold text-foreground [font-variant-numeric:tabular-nums]'>
                          {formatCurrencyMinor(
                            category.totalSpendMinor,
                            overview.currencyCode,
                          )}
                        </span>
                        <Badge className='text-primary' variant='secondary'>
                          {percent}%
                        </Badge>
                      </div>
                    </article>
                  )
                })}
              </div>
            )
          }}
        </QueryState>
      </CardContent>
    </Card>
  )
}
