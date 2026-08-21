import { useEffectEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageFooter, TmaPageShell } from '@/components/shared/tma-page-shell'
import { useCreateExpenseMutation } from '@/features/expenses/api'
import { confirmImport } from '@/features/expenses/import-confirm'
import { useImportFlowStore } from '@/features/expenses/model/import-store'
import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '@/features/groups/api'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { TMA_PATHS } from '@/lib/constants/routes'
import { notification } from '@/lib/telegram/haptics'

import { ImportPreviewItemCard } from '../components/add-expense-import-preview-item-card'
import {
  ImportPreviewEmpty,
  ImportPreviewHeader,
  useImportGroupItems,
  useImportPickerLoading,
  useImportPreviewPickerOptions,
} from '../components/import-preview-support'

export const AddExpenseImportPreviewPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const items = useImportFlowStore((s) => s.items)
  const toggleInclude = useImportFlowStore((s) => s.toggleInclude)
  const setItemCategory = useImportFlowStore((s) => s.setItemCategory)
  const setItemContext = useImportFlowStore((s) => s.setItemContext)
  const setItemStatus = useImportFlowStore((s) => s.setItemStatus)
  const reset = useImportFlowStore((s) => s.reset)
  const createExpenseMutation = useCreateExpenseMutation()
  const householdsQuery = useHouseholdsQuery()
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
  const categoriesQuery = useReferenceCategoriesQuery()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const households = householdsQuery.data?.items ?? []
  const householdGroupQueries = useHouseholdExpenseGroupQueries(households)
  const groupItems = useImportGroupItems(
    households,
    householdGroupQueries,
    personalGroupsQuery,
  )
  const referenceCategories = categoriesQuery.data?.items ?? []
  const pickerOptions = useImportPreviewPickerOptions(
    households,
    groupItems,
    referenceCategories,
    t,
  )
  const pickerLoading = useImportPickerLoading(
    householdsQuery.isLoading,
    personalGroupsQuery.isLoading,
    householdGroupQueries.some((q) => q.isLoading),
    categoriesQuery.isLoading,
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
      const result = await confirmImport(items, (p) =>
        createExpenseMutation.mutateAsync(p),
      )
      for (const id of result.succeeded) setItemStatus(id, 'success')
      for (const { id, error } of result.failed)
        setItemStatus(id, 'error', error)
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
  if (!hasItems) {
    return (
      <TmaPageShell
        contentClassName='gap-4'
        title={t('expenses.add.importPreviewTitle')}>
        <ImportPreviewEmpty />
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell
      contentClassName='gap-4'
      footer={
        <TmaPageFooter>
          <TmaHapticButton
            aria-busy={isSaving}
            disabled={isSaving || selectedCount === 0}
            onClick={() => void handleSave()}>
            {isSaving
              ? t('expenses.add.saving')
              : t('expenses.add.importAction', { count: selectedCount })}
          </TmaHapticButton>
        </TmaPageFooter>
      }
      title={t('expenses.add.importPreviewTitle')}>
      <ImportPreviewHeader count={items.length} feedback={feedback} />
      <div className='grid gap-3'>
        {items.map((item, index) => (
          <ImportPreviewItemCard
            key={item.id}
            index={index}
            isSaving={isSaving}
            item={item}
            pickerLoading={pickerLoading}
            pickerOptions={pickerOptions}
            onSetItemCategory={setItemCategory}
            onSetItemContext={setItemContext}
            onToggleInclude={toggleInclude}
          />
        ))}
      </div>
    </TmaPageShell>
  )
}
