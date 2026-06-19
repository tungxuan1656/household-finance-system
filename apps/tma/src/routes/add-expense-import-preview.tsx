import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  Card,
  CardDescription,
  MoneyLabel,
  NativePicker,
} from '@/components/ui'
import { useCreateExpenseMutation } from '@/features/expenses/api'
import { confirmImport } from '@/features/expenses/import-confirm'
import { useImportFlowStore } from '@/features/expenses/import-store'
import { getSourceLabel } from '@/features/expenses/presentation'
import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '@/features/groups/api'
import type { GroupListItem } from '@/features/groups/types'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { getCategoryPresentation } from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatVnd } from '@/lib/formatters'
import {
  hideBottomButton,
  setBottomButton,
  updateBottomButton,
} from '@/lib/telegram/bottom-button'
import { notification } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

const ROW_LABEL_CLASS =
  'text-[11px] font-bold tracking-[0.04em] text-tma-text-muted uppercase'
const ROW_VALUE_CLASS = 'text-sm text-tma-text-strong'
const PICKER_LABEL_CLASS =
  'w-16 shrink-0 text-xs font-semibold text-tma-text-muted'

export const AddExpenseImportPreviewPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const items = useImportFlowStore((state) => state.items)
  const toggleInclude = useImportFlowStore((state) => state.toggleInclude)
  const setItemContext = useImportFlowStore((state) => state.setItemContext)
  const setItemStatus = useImportFlowStore((state) => state.setItemStatus)
  const reset = useImportFlowStore((state) => state.reset)

  const createExpenseMutation = useCreateExpenseMutation()
  const householdsQuery = useHouseholdsQuery()
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
  const referenceCategoriesQuery = useReferenceCategoriesQuery()

  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const households = householdsQuery.data?.items ?? []
  const householdGroupQueries = useHouseholdExpenseGroupQueries(households)
  const referenceCategories = referenceCategoriesQuery.data?.items ?? []

  const groupItems = useMemo<GroupListItem[]>(() => {
    const personalGroups = personalGroupsQuery.data?.items ?? []

    return [
      ...personalGroups.map((group) => ({ group, household: null })),
      ...households.flatMap((household, index) => {
        const query = householdGroupQueries[index]
        const groups = query?.data?.items ?? []

        return groups.map((group) => ({ group, household }))
      }),
    ].sort((left, right) => right.group.createdAt - left.group.createdAt)
  }, [householdGroupQueries, households, personalGroupsQuery.data?.items])

  const householdPickerOptions = useMemo(
    () => [
      { value: '', label: t('expenses.add.contextPersonal') },
      ...households.map((h) => ({ value: h.id, label: h.name })),
    ],
    [households, t],
  )

  const groupPickerOptions = useMemo(
    () => [
      { value: '', label: t('expenses.edit.optionUngrouped') },
      ...groupItems.map((item) => ({
        value: item.group.id,
        label: item.group.name,
      })),
    ],
    [groupItems, t],
  )

  const selectedCount = items.filter(
    (i) => i.include && i.status !== 'success',
  ).length
  const hasItems = items.length > 0

  const handleSave = useEffectEvent(async () => {
    if (!hasItems || isSaving) return

    setFeedback(null)
    setIsSaving(true)

    try {
      const result = await confirmImport(items, (payload) =>
        createExpenseMutation.mutateAsync(payload),
      )

      for (const id of result.succeeded) {
        setItemStatus(id, 'success')
      }

      for (const { id, error } of result.failed) {
        setItemStatus(id, 'error', error)
      }

      if (result.failed.length > 0) {
        notification('error')

        setFeedback(
          t('expenses.add.importPartialFail', {
            succeeded: result.succeeded.length,
            failed: result.failed.length,
          }),
        )
      } else {
        notification('success')
        reset()
        navigate(TMA_PATHS.expenses, { replace: true })
      }
    } catch (error) {
      notification('error')

      setFeedback(
        error instanceof Error ? error.message : t('expenses.add.saveError'),
      )
    } finally {
      setIsSaving(false)
    }
  })

  // Mount BottomButton once per page lifetime; re-mount only on items-length boundary
  useEffect(() => {
    if (!hasItems) return

    const cleanup = setBottomButton({
      text: t('expenses.add.importAction', { count: selectedCount }),
      enabled: false,
      showProgress: false,
      onClick: () => {
        void handleSave()
      },
    })

    return cleanup
  }, [hasItems, t])

  // Update visual props (title/enabled/progress) without re-binding the handler
  useEffect(() => {
    if (!hasItems) return

    updateBottomButton({
      text: isSaving
        ? t('expenses.add.saving')
        : t('expenses.add.importAction', { count: selectedCount }),
      enabled: !isSaving,
      showProgress: isSaving,
    })
  }, [hasItems, selectedCount, isSaving, t])

  // Hide BottomButton on unmount
  useEffect(() => () => hideBottomButton(), [])

  if (!hasItems) {
    return (
      <TmaPageShell title={t('expenses.add.importPreviewTitle')}>
        <Card>
          <CardDescription>{t('expenses.add.importEmptyDesc')}</CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell
      reserveBottomButton
      title={t('expenses.add.importPreviewTitle')}>
      {feedback ? (
        <Card className='mb-3 border-tma-error/20 bg-tma-error-bg/90'>
          <CardDescription className='text-tma-error'>
            {feedback}
          </CardDescription>
        </Card>
      ) : null}

      <div className='mb-2 text-sm font-semibold text-tma-text-muted'>
        {t('expenses.add.importItemCount', { count: items.length })}
      </div>

      <div className='grid gap-3'>
        {items.map((item, index) => {
          const presentation = getCategoryPresentation(
            item.parsed.categoryKey as never,
            t,
            referenceCategories,
          )
          const sourceLabel = getSourceLabel(item.parsed.sourceKey, t)

          return (
            <Card
              key={item.id}
              className={cn(
                'grid animate-tma-card-enter gap-2.5 p-3',
                !item.include && 'opacity-50',
                item.status === 'success' && 'border-tma-positive/30',
                item.status === 'error' &&
                  'border-tma-error/20 bg-tma-error-bg/60',
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
                    onChange={() => toggleInclude(item.id)}
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
                  <span className={ROW_LABEL_CLASS}>
                    {t('expenses.add.dateLabel')}
                  </span>
                  <span className={ROW_VALUE_CLASS}>
                    {item.parsed.occurredAt}
                  </span>
                </div>
                <div className='grid gap-0.5'>
                  <span className={ROW_LABEL_CLASS}>
                    {t('expenses.add.source')}
                  </span>
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
                        disabled={householdsQuery.isLoading || isSaving}
                        options={householdPickerOptions}
                        value={item.householdId ?? ''}
                        onChange={(next) =>
                          setItemContext(item.id, {
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
                        disabled={personalGroupsQuery.isLoading || isSaving}
                        options={groupPickerOptions}
                        value={item.groupId ?? ''}
                        onChange={(next) =>
                          setItemContext(item.id, {
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
        })}
      </div>
    </TmaPageShell>
  )
}
