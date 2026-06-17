import { Card, Section, SectionHeader } from '@/components/ui'
import { formatCurrencyMinor } from '@/features/home/presentation'
import { cn } from '@/lib/utils'

import type { BudgetStatusDTO } from '../types'
import { StatTile } from './stat-tile'

type BudgetProgressSectionProps = {
  status: BudgetStatusDTO
  progress: { percentUsed: number; widthPercent: number }
  isOver: boolean
  t: (key: string, options?: Record<string, unknown>) => string
}

export const BudgetProgressSection = ({
  status,
  progress,
  isOver,
  t,
}: BudgetProgressSectionProps) => (
  <Section>
    <SectionHeader title={t('budgets.detail.statProgress')} />
    <Card className='grid gap-4'>
      <div className='grid grid-cols-2 gap-2.5'>
        <StatTile
          label={t('budgets.detail.statSpent')}
          value={formatCurrencyMinor(
            status.totalActualMinor,
            status.currencyCode,
          )}
        />
        <StatTile
          label={t('budgets.detail.statRemaining')}
          tone={isOver ? 'warning' : 'default'}
          value={formatCurrencyMinor(
            status.totalRemainingMinor,
            status.currencyCode,
          )}
        />
      </div>

      <div className='grid gap-1.5'>
        <div className='flex items-center justify-between text-sm text-tma-text-muted'>
          <span>{t('budgets.detail.statProgress')}</span>
          <span>{progress.percentUsed}%</span>
        </div>
        <div className='h-2 overflow-hidden rounded-full bg-black/6'>
          <div
            className={cn(
              'h-full rounded-full',
              isOver ? 'bg-[#d93838]' : 'bg-tma-primary',
            )}
            style={{ width: `${progress.widthPercent}%` }}
          />
        </div>
      </div>
    </Card>
  </Section>
)
