'use client'

import * as React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'
import { getCategoryPresentation } from '@/lib/reference-data/category-presentation'
import type { ReferenceCategoryDTO } from '@/types/reference-data'
import { formatCurrency } from '@/views/app/overview/overview-formatters'

type CategoryItem = {
  categoryKey: string
  totalSpendMinor: number
  percentOfTotal: number
}

type CategoryBreakdownProps = {
  categories: CategoryItem[]
  currencyCode: string
  totalSpendMinor: number
  isLoading: boolean
  isEmpty: boolean
  referenceCategories?: ReferenceCategoryDTO[]
}

function CategoryBreakdown({
  categories,
  currencyCode,
  isLoading,
  isEmpty,
  referenceCategories,
}: CategoryBreakdownProps) {
  return (
    <Card surface='glass'>
      <CardHeader>
        <CardTitle>{t('app.overview.categoryBreakdown.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <div className='space-y-3'>
            {categories.map((cat) => {
              const presentation = getCategoryPresentation(
                cat.categoryKey,
                referenceCategories,
              )
              const accentStyle = presentation.color
                ? { color: presentation.color }
                : undefined
              const progressStyle = presentation.color
                ? ({
                    '--progress-background': presentation.color,
                  } as React.CSSProperties)
                : undefined

              return (
                <div key={cat.categoryKey} className='flex flex-col gap-1'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium' style={accentStyle}>
                      {presentation.label}
                    </span>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono text-sm text-muted-foreground tabular-nums'>
                        {cat.percentOfTotal}%
                      </span>
                      <span
                        className='font-mono text-sm tabular-nums'
                        style={accentStyle}>
                        {formatCurrency(cat.totalSpendMinor, currencyCode)}
                      </span>
                    </div>
                  </div>
                  <Progress
                    className='h-1.5 rounded-full'
                    style={progressStyle}
                    value={cat.percentOfTotal}
                  />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className='space-y-4'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='flex flex-col gap-1'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-4 w-20' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-4 w-10' />
              <Skeleton className='h-4 w-16' />
            </div>
          </div>
          <Skeleton className='h-2 w-full rounded-full' />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className='py-4 text-center'>
      <p className='text-sm text-muted-foreground'>
        {t('app.overview.categoryBreakdown.empty')}
      </p>
    </div>
  )
}

export type { CategoryBreakdownProps, CategoryItem }
export { CategoryBreakdown }
