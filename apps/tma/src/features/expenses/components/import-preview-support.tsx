// TODO: Move hooks (useImportGroupItems, useImportPreviewPickerOptions, useImportPickerLoading) to features/expenses/hooks/ to avoid hooks-in-components folder churn; kept here for now to minimize diff.
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import type { GroupListItem } from '@/features/groups/types'
import { getCategoryPresentation } from '@/features/home/presentation'
import type { ReferenceCategoryDTO } from '@/features/home/types'

type PickerOption = { value: string; label: string }

export function useImportGroupItems(
  households: { id: string }[],
  queries: { data?: { items: GroupListItem['group'][] } }[],
  personalQuery: { data?: { items: GroupListItem['group'][] } },
): GroupListItem[] {
  return useMemo(() => {
    const personal = personalQuery.data?.items ?? []

    return [
      ...personal.map((group) => ({ group, household: null })),
      ...households.flatMap((h, i) => {
        const groups = queries[i]?.data?.items ?? []

        return groups.map((group) => ({ group, household: h as never }))
      }),
    ].sort((a, b) => b.group.createdAt - a.group.createdAt)
  }, [households, queries, personalQuery.data?.items])
}

export function useImportPreviewPickerOptions(
  households: { id: string; name: string }[],
  groupItems: GroupListItem[],
  referenceCategories: ReferenceCategoryDTO[],
  t: (key: string, opts?: Record<string, unknown>) => string,
) {
  const householdOptions = useMemo<PickerOption[]>(
    () => [
      { value: '', label: t('expenses.add.contextPersonal') },
      ...households.map((h) => ({ value: h.id, label: h.name })),
    ],
    [households, t],
  )
  const groupOptions = useMemo<PickerOption[]>(
    () => [
      { value: '', label: t('expenses.edit.optionUngrouped') },
      ...groupItems.map((it) => ({ value: it.group.id, label: it.group.name })),
    ],
    [groupItems, t],
  )
  const categoryOptions = useMemo<PickerOption[]>(() => {
    const expenseCats = referenceCategories.filter((c) => c.kind === 'expense')
    const hasOther = expenseCats.some((c) => c.key === 'other')
    const fallback = hasOther
      ? []
      : [{ value: 'other', label: t('categories.other') }]

    return [
      ...fallback,
      ...expenseCats.map((cat) => ({
        value: cat.key,
        label: getCategoryPresentation(cat.key, t, referenceCategories).label,
      })),
    ]
  }, [referenceCategories, t])

  return {
    households: householdOptions,
    groups: groupOptions,
    categories: categoryOptions,
  }
}

export function useImportPickerLoading(
  householdsLoading: boolean,
  groupsLoading: boolean,
  householdGroupsLoading: boolean,
  categoriesLoading: boolean,
) {
  return useMemo(
    () => ({
      households: householdsLoading,
      groups: groupsLoading || householdGroupsLoading,
      categories: categoriesLoading,
    }),
    [
      householdsLoading,
      groupsLoading,
      householdGroupsLoading,
      categoriesLoading,
    ],
  )
}

export function ImportPreviewEmpty() {
  const { t } = useTranslation()

  return (
    <Card size='sm'>
      <Empty className='py-8'>
        <EmptyHeader>
          <EmptyTitle>{t('expenses.add.importEmptyTitle')}</EmptyTitle>
          <EmptyDescription>
            {t('expenses.add.importEmptyDesc')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Card>
  )
}

export function ImportPreviewHeader({
  feedback,
  count,
}: {
  feedback: string | null
  count: number
}) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-3'>
      {feedback ? (
        <Card
          className='border-destructive/20 bg-destructive/5'
          role='alert'
          size='sm'>
          <CardHeader className='py-3'>
            <CardDescription className='leading-snug font-medium text-destructive'>
              {feedback}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
      <p className='px-1 text-sm text-muted-foreground'>
        {t('expenses.add.importItemCount', { count })}
      </p>
    </div>
  )
}
