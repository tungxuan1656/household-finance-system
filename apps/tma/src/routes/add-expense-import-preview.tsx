import { useEffectEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Button, Card, CardDescription } from '@/components/ui'
import { useCreateExpenseMutation } from '@/features/expenses/api'
import { confirmImport } from '@/features/expenses/import-confirm'
import { useImportFlowStore } from '@/features/expenses/import-store'
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
import { notification } from '@/lib/telegram/haptics'

import { ImportPreviewItemCard } from './add-expense-import-preview-item-card'

export const AddExpenseImportPreviewPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const items = useImportFlowStore((state) => state.items)
  const toggleInclude = useImportFlowStore((state) => state.toggleInclude)
  const setItemCategory = useImportFlowStore((state) => state.setItemCategory)
  const setItemContext = useImportFlowStore((state) => state.setItemContext)
  const setItemStatus = useImportFlowStore((state) => state.setItemStatus)
  const reset = useImportFlowStore((state) => state.reset)

  const createExpenseMutation = useCreateExpenseMutation()
  const householdsQuery = useHouseholdsQuery()
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
  const categoriesQuery = useReferenceCategoriesQuery()
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

  const referenceCategories = categoriesQuery.data?.items ?? []
  const categoryPickerOptions = useMemo(() => {
    const expenseCats = referenceCategories.filter(
      (cat) => cat.kind === 'expense',
    )
    const hasOther = expenseCats.some((cat) => cat.key === 'other')
    const fallback = hasOther
      ? []
      : [{ value: 'other' as const, label: t('categories.other') }]

    return [
      ...fallback,
      ...expenseCats.map((cat) => ({
        value: cat.key,
        label: getCategoryPresentation(cat.key, t, referenceCategories).label,
      })),
    ]
  }, [referenceCategories, t])

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
    <TmaPageShell title={t('expenses.add.importPreviewTitle')}>
      {feedback ? (
        <Card className='mb-3 border-destructive/20 bg-destructive/10'>
          <CardDescription className='text-destructive'>
            {feedback}
          </CardDescription>
        </Card>
      ) : null}

      <div className='mb-2 text-sm font-semibold text-muted-foreground'>
        {t('expenses.add.importItemCount', { count: items.length })}
      </div>

      <div className='grid gap-3'>
        {items.map((item, index) => (
          <ImportPreviewItemCard
            key={item.id}
            categoriesLoading={categoriesQuery.isLoading}
            categoryPickerOptions={categoryPickerOptions}
            groupPickerOptions={groupPickerOptions}
            groupsLoading={personalGroupsQuery.isLoading}
            householdPickerOptions={householdPickerOptions}
            householdsLoading={householdsQuery.isLoading}
            index={index}
            isSaving={isSaving}
            item={item}
            onSetItemCategory={setItemCategory}
            onSetItemContext={setItemContext}
            onToggleInclude={toggleInclude}
          />
        ))}
      </div>

      <Button
        aria-busy={isSaving}
        className='mt-5 mb-2 w-full'
        disabled={isSaving}
        onClick={() => {
          void handleSave()
        }}>
        {isSaving
          ? t('expenses.add.saving')
          : t('expenses.add.importAction', { count: selectedCount })}
      </Button>
    </TmaPageShell>
  )
}
