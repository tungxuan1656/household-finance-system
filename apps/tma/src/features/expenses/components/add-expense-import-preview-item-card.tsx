import { useTranslation } from 'react-i18next'

import { NativePicker } from '@/components/shared/native-picker'
import { TmaCategoryIconBadge } from '@/components/shared/tma-page-shell'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import type { ImportItemDraft } from '@/features/expenses/model/import-store'
import { getSourceLabel } from '@/features/expenses/presentation'
import { normalizeCategoryKey } from '@/features/home/category-key'
import { useCategoryPresentation } from '@/features/home/presentation'
import { formatVnd } from '@/lib/formatters'
import { cn } from '@/lib/utils'

type PickerOption = { value: string; label: string }

type Props = {
  item: ImportItemDraft
  index: number
  isSaving: boolean
  pickerOptions: {
    categories: PickerOption[]
    households: PickerOption[]
    groups: PickerOption[]
  }
  pickerLoading: {
    categories: boolean
    households: boolean
    groups: boolean
  }
  onToggleInclude: (id: string) => void
  onSetItemCategory: (id: string, categoryKey: string) => void
  onSetItemContext: (
    id: string,
    ctx: { householdId?: string | null; groupId?: string | null },
  ) => void
}

export const ImportPreviewItemCard = ({
  item,
  index: _index,
  isSaving,
  pickerOptions,
  pickerLoading,
  onToggleInclude,
  onSetItemCategory,
  onSetItemContext,
}: Props) => {
  void _index

  const { t } = useTranslation()
  const presentation = useCategoryPresentation(
    normalizeCategoryKey(item.parsed.categoryKey),
  )
  const sourceLabel = getSourceLabel(item.parsed.sourceKey, t)

  return (
    <Card className={cn(!item.include && 'opacity-50')} size='sm'>
      <CardHeader>
        <div className='flex items-start gap-3'>
          <label className='-my-1 -ml-2 flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center p-2'>
            <input
              aria-label={t('expenses.add.includeItem')}
              checked={item.include}
              className='size-5 accent-primary'
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
            <FieldGroup className='gap-4'>
              <Field>
                <FieldLabel
                  className='sr-only'
                  htmlFor={`import-category-${item.id}`}>
                  {t('expenses.add.chooseCategory')}
                </FieldLabel>
                <NativePicker
                  fullWidth
                  aria-label={t('expenses.add.chooseCategory')}
                  disabled={
                    item.status === 'success' ||
                    isSaving ||
                    pickerLoading.categories
                  }
                  id={`import-category-${item.id}`}
                  options={pickerOptions.categories}
                  showIcon={false}
                  size='sm'
                  value={item.parsed.categoryKey}
                  onChange={(next) => onSetItemCategory(item.id, next)}
                />
              </Field>
            </FieldGroup>
            <p className='mt-1 text-sm font-semibold wrap-break-word'>
              {item.parsed.title}
            </p>
          </div>
          <div className='min-w-0 shrink-0 text-right'>
            <span className='font-mono text-sm font-semibold wrap-break-word text-foreground [font-variant-numeric:tabular-nums] sm:text-lg'>
              {formatVnd(item.parsed.amount)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className='grid gap-3'>
        <div className='grid grid-cols-2 gap-3'>
          <div className='grid min-w-0 gap-0.5'>
            <CardDescription>{t('expenses.add.dateLabel')}</CardDescription>
            <span className='truncate text-sm text-foreground'>
              {item.parsed.occurredAt}
            </span>
          </div>
          <div className='grid min-w-0 gap-0.5'>
            <CardDescription>{t('expenses.add.source')}</CardDescription>
            <span className='truncate text-sm text-foreground'>
              {sourceLabel}
            </span>
          </div>
        </div>
        {item.status !== 'success' ? (
          <FieldGroup className='gap-4'>
            <Field>
              <FieldLabel htmlFor={`import-household-${item.id}`}>
                {t('expenses.add.contextHousehold')}
              </FieldLabel>
              <NativePicker
                fullWidth
                aria-label={t('expenses.add.chooseHousehold')}
                disabled={pickerLoading.households || isSaving}
                id={`import-household-${item.id}`}
                options={pickerOptions.households}
                value={item.householdId ?? ''}
                onChange={(next) =>
                  onSetItemContext(item.id, { householdId: next || null })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`import-group-${item.id}`}>
                {t('expenses.add.contextGroup')}
              </FieldLabel>
              <NativePicker
                fullWidth
                aria-label={t('expenses.add.chooseGroup')}
                disabled={pickerLoading.groups || isSaving}
                id={`import-group-${item.id}`}
                options={pickerOptions.groups}
                value={item.groupId ?? ''}
                onChange={(next) =>
                  onSetItemContext(item.id, { groupId: next || null })
                }
              />
            </Field>
          </FieldGroup>
        ) : null}
      </CardContent>
      {item.status === 'success' || (item.status === 'error' && item.error) ? (
        <CardFooter className='flex flex-wrap items-center gap-2'>
          {item.status === 'success' ? (
            <Badge className='text-emerald-600' variant='secondary'>
              {t('expenses.add.importSuccess')}
            </Badge>
          ) : null}
          {item.status === 'error' ? (
            <Badge variant='destructive'>{t('common.error')}</Badge>
          ) : null}
          {item.status === 'error' && item.error ? (
            <CardDescription className='text-destructive'>
              {item.error}
            </CardDescription>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  )
}
