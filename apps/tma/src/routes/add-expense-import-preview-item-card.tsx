import { TmaCategoryIconBadge } from '@/components/shared/tma-page-shell'
import { Card, CardDescription, MoneyLabel, NativePicker } from '@/components/ui'
import type { ImportItemDraft } from '@/features/expenses/import-store'
import { getSourceLabel } from '@/features/expenses/presentation'
import { getCategoryPresentation } from '@/features/home/presentation'
import { formatVnd } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { TFunction } from 'i18next'

const ROW_LABEL_CLASS =
  'text-[11px] font-bold tracking-[0.04em] text-tma-text-muted uppercase'
const ROW_VALUE_CLASS = 'text-sm text-tma-text-strong'
const PICKER_LABEL_CLASS =
  'w-16 shrink-0 text-xs font-semibold text-tma-text-muted'

type Props = {
  item: ImportItemDraft
  index: number
  isSaving: boolean
  householdPickerOptions: { value: string; label: string }[]
  groupPickerOptions: { value: string; label: string }[]
  householdsLoading: boolean
  groupsLoading: boolean
  t: TFunction
  onToggleInclude: (id: string) => void
  onSetItemContext: (id: string, ctx: { householdId?: string; groupId?: string }) => void
}

export const ImportPreviewItemCard = ({
  item,
  index,
  isSaving,
  householdPickerOptions,
  groupPickerOptions,
  householdsLoading,
  groupsLoading,
  t,
  onToggleInclude,
  onSetItemContext,
}: Props) => {
  const presentation = getCategoryPresentation(
    item.parsed.categoryKey as never,
    t,
    [],
  )
  const sourceLabel = getSourceLabel(item.parsed.sourceKey, t)

  return (
    <Card
      className={cn(
        'grid animate-tma-card-enter gap-2.5 p-3',
        !item.include && 'opacity-50',
        item.status === 'success' && 'border-tma-positive/30',
        item.status === 'error' && 'border-tma-error/20 bg-tma-error-bg/60',
      )}
      style={{ animationDelay: `${index * 40}ms` }}>
      {/* Row 1: checkbox | category+title | money */}
      <div className='flex items-start gap-3'>
        <label className='mt-2 flex shrink-0 cursor-pointer items-center'>
          <input
            aria-label={t('expenses.add.includeItem')}
            checked={item.include}
            className='size-5.5 accent-tma-primary'
            disabled={item.status === 'success' || isSaving}
            type='checkbox'
            onChange={() => onToggleInclude(item.id)}
          />
        </label>

        <TmaCategoryIconBadge
          accent={presentation.accent}
          iconUrl={presentation.iconUrl}
          size='sm'
          symbol={presentation.symbol}
        />

        <div className='min-w-0 flex-1'>
          <div
            className={cn(
              ROW_LABEL_CLASS,
              'text-sm text-tma-text-strong/80',
            )}>
            {presentation.label}
          </div>
          <div className='truncate text-sm font-semibold text-tma-text-strong'>
            {item.parsed.title}
          </div>
        </div>

        <div className='shrink-0 text-right text-lg font-semibold'>
          <MoneyLabel>{formatVnd(item.parsed.amount)}</MoneyLabel>
        </div>
      </div>

      {/* Row 2: 2-column meta (date, source) */}
      <div className='grid grid-cols-2 gap-3 pl-8'>
        <div className='grid gap-0.5'>
          <span className={ROW_LABEL_CLASS}>{t('expenses.add.dateLabel')}</span>
          <span className={ROW_VALUE_CLASS}>{item.parsed.occurredAt}</span>
        </div>
        <div className='grid gap-0.5'>
          <span className={ROW_LABEL_CLASS}>{t('expenses.add.source')}</span>
          <span className={ROW_VALUE_CLASS}>{sourceLabel}</span>
        </div>
      </div>

      {/* Row 3: context pickers (label left, picker right) */}
      {item.status !== 'success' ? (
        <div className='grid gap-2 border-t border-tma-line pt-2.5 pl-2'>
          <div className='flex items-center gap-3'>
            <span className={PICKER_LABEL_CLASS}>
              {t('expenses.add.contextHousehold')}
            </span>
            <div className='min-w-0 flex-1'>
              <NativePicker
                fullWidth
                aria-label={t('expenses.add.chooseHousehold')}
                disabled={householdsLoading || isSaving}
                options={householdPickerOptions}
                value={item.householdId ?? ''}
                onChange={(next) =>
                  onSetItemContext(item.id, {
                    householdId: next || undefined,
                  })
                }
              />
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <span className={PICKER_LABEL_CLASS}>
              {t('expenses.add.contextGroup')}
            </span>
            <div className='min-w-0 flex-1'>
              <NativePicker
                fullWidth
                aria-label={t('expenses.add.chooseGroup')}
                disabled={groupsLoading || isSaving}
                options={groupPickerOptions}
                value={item.groupId ?? ''}
                onChange={(next) =>
                  onSetItemContext(item.id, {
                    groupId: next || undefined,
                  })
                }
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Status indicator */}
      {item.status === 'success' ? (
        <div className='pl-7 text-xs font-semibold text-tma-positive'>
          {t('expenses.add.importSuccess')}
        </div>
      ) : null}
      {item.status === 'error' && item.error ? (
        <div className='pl-7 text-xs font-semibold text-tma-error'>
          {item.error}
        </div>
      ) : null}
    </Card>
  )
}
