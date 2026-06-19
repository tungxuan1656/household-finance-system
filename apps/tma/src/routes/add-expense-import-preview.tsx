import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Card, CardDescription } from '@/components/ui'
import { useCreateExpenseMutation } from '@/features/expenses/api'
import { confirmImport } from '@/features/expenses/import-confirm'
import { useImportFlowStore } from '@/features/expenses/import-store'
import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '@/features/groups/api'
import type { GroupListItem } from '@/features/groups/types'
import { useHouseholdsQuery } from '@/features/home/api'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  hideBottomButton,
  setBottomButton,
  updateBottomButton,
} from '@/lib/telegram/bottom-button'
import { notification } from '@/lib/telegram/haptics'

import { ImportPreviewItemCard } from './add-expense-import-preview-item-card'

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
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const households = householdsQuery.data?.items ?? []
  const householdGroupQueries = useHouseholdExpenseGroupQueries(households)

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

  // Mount BottomButton once per page lifetime
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

  // Update visual props (title/enabled/progress) without re-binding handler
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
        {items.map((item, index) => (
          <ImportPreviewItemCard
            key={item.id}
            groupPickerOptions={groupPickerOptions}
            groupsLoading={personalGroupsQuery.isLoading}
            householdPickerOptions={householdPickerOptions}
            householdsLoading={householdsQuery.isLoading}
            index={index}
            isSaving={isSaving}
            item={item}
            t={t}
            onSetItemContext={setItemContext}
            onToggleInclude={toggleInclude}
          />
        ))}
      </div>
    </TmaPageShell>
  )
}
