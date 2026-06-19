import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { SummaryRow } from '@/components/shared/summary-row'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardDescription,
  CardTitle,
  Field,
  FieldLabel,
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
import {
  hideBottomButton,
  setBottomButton,
  updateBottomButton,
} from '@/lib/telegram/bottom-button'
import { notification } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

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
  const hasSelection = selectedCount > 0

  const handleSave = async () => {
    if (!hasSelection || isSaving) return

    setFeedback(null)
    setIsSaving(true)

    try {
      const result = await confirmImport(items, (payload) =>
        createExpenseMutation.mutateAsync(payload),
      )

      // Mark succeeded items
      for (const id of result.succeeded) {
        setItemStatus(id, 'success')
      }

      // Mark failed items
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
  }

  // BottomButton lifecycle
  useEffect(() => {
    if (!hasSelection || items.length === 0) return

    const cleanup = setBottomButton({
      text: t('expenses.add.importAction', { count: selectedCount }),
      enabled: !isSaving,
      showProgress: isSaving,
      onClick: () => {
        void handleSave()
      },
    })

    return cleanup
  }, [hasSelection, items.length, selectedCount, isSaving, t])

  useEffect(() => {
    if (items.length === 0 || !hasSelection) return

    updateBottomButton({
      text: isSaving
        ? t('expenses.add.saving')
        : t('expenses.add.importAction', { count: selectedCount }),
      enabled: !isSaving,
      showProgress: isSaving,
    })
  }, [selectedCount, isSaving, hasSelection, items.length, t])

  useEffect(() => {
    return () => {
      hideBottomButton()
    }
  }, [])

  // If no items, show empty state with back link
  if (items.length === 0) {
    return (
      <TmaPageShell title={t('expenses.add.importPreviewTitle')}>
        <Card>
          <CardTitle>{t('expenses.add.importEmptyTitle')}</CardTitle>
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
                'grid animate-tma-card-enter gap-3',
                !item.include && 'opacity-50',
                item.status === 'success' && 'border-tma-positive/30',
                item.status === 'error' &&
                  'border-tma-error/20 bg-tma-error-bg/60',
              )}
              style={{ animationDelay: `${index * 40}ms` }}>
              {/* Include toggle + category + title + money */}
              <div className='flex items-start gap-3'>
                <label className='flex cursor-pointer items-center gap-2'>
                  <input
                    aria-label={t('expenses.add.includeItem')}
                    checked={item.include}
                    className='size-5 accent-tma-primary'
                    disabled={item.status === 'success' || isSaving}
                    type='checkbox'
                    onChange={() => toggleInclude(item.id)}
                  />
                </label>

                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <CardTitle className='text-sm'>
                      {presentation.label}
                    </CardTitle>
                  </div>
                  <CardDescription className='truncate'>
                    {item.parsed.title}
                  </CardDescription>
                </div>

                <div className='shrink-0 text-right'>
                  <MoneyLabel>
                    {item.parsed.amount.toLocaleString('vi-VN')}₫
                  </MoneyLabel>
                </div>
              </div>

              {/* Metadata row */}
              <div className='grid grid-cols-2 gap-2 border-t border-tma-line pt-2.5'>
                <SummaryRow
                  label={t('expenses.add.source')}
                  value={sourceLabel}
                />
                <SummaryRow
                  label={t('expenses.add.dateLabel')}
                  value={item.parsed.occurredAt}
                />
              </div>

              {/* Context selectors */}
              {item.status !== 'success' ? (
                <div className='grid gap-3 border-t border-tma-line pt-2.5'>
                  <Field>
                    <FieldLabel>
                      {t('expenses.add.contextHousehold')}
                    </FieldLabel>
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
                  </Field>
                  <Field>
                    <FieldLabel>{t('expenses.add.contextGroup')}</FieldLabel>
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
                  </Field>
                </div>
              ) : null}

              {/* Status indicator */}
              {item.status === 'success' ? (
                <div className='text-xs font-semibold text-tma-positive'>
                  {t('expenses.add.importSuccess')}
                </div>
              ) : null}
              {item.status === 'error' && item.error ? (
                <div className='text-xs font-semibold text-tma-error'>
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
