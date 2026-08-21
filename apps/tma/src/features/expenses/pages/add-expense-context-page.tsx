import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { NativePicker } from '@/components/shared/native-picker'
import { SummaryRow } from '@/components/shared/summary-row'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  TmaCategoryIconBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { useCreateExpenseMutation } from '@/features/expenses/api'
import { useAddExpenseContextActions } from '@/features/expenses/hooks/use-add-expense-context-actions'
import { useAddExpenseFlowStore } from '@/features/expenses/model/store'
import { getSourceOptions } from '@/features/expenses/presentation'
import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '@/features/groups/api'
import { getGroupContextLabel } from '@/features/groups/presentation'
import type { GroupListItem } from '@/features/groups/types'
import { useHouseholdsQuery } from '@/features/home/api'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel, formatVnd } from '@/lib/formatters'

export const AddExpenseContextPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const date = useAddExpenseFlowStore((state) => state.date)
  const category = useAddExpenseFlowStore((state) => state.category)
  const amount = useAddExpenseFlowStore((state) => state.amount)
  const title = useAddExpenseFlowStore((state) => state.title)
  const sourceId = useAddExpenseFlowStore((state) => state.sourceId)
  const householdId = useAddExpenseFlowStore((state) => state.householdId)
  const groupId = useAddExpenseFlowStore((state) => state.groupId)
  const setContext = useAddExpenseFlowStore((state) => state.setContext)
  const reset = useAddExpenseFlowStore((state) => state.reset)
  const householdsQuery = useHouseholdsQuery()
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
  const createExpenseMutation = useCreateExpenseMutation()
  const [feedback, setFeedback] = useState<string | null>(null)

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

  const selectedSource =
    getSourceOptions(t).find((source) => source.id === sourceId) ?? null
  const selectedHousehold = households.find(
    (household) => household.id === householdId,
  )
  const selectedGroupItem =
    groupItems.find((item) => item.group.id === groupId) ?? null
  const isReady = category !== null && amount > 0 && sourceId !== null

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

  const { handleSave } = useAddExpenseContextActions({
    t,
    navigate,
    amount,
    category,
    title,
    date,
    sourceId,
    householdId,
    groupId,
    createExpenseMutation,
    setFeedback,
    reset,
  })

  if (!isReady || !category) {
    return (
      <TmaPageShell title={t('expenses.add.title')}>
        <TmaPageHeader
          eyebrow={t('expenses.add.step', { current: '3', total: '3' })}
          title={t('expenses.add.backToStep2')}
        />
        <Card>
          <CardHeader>
            <CardTitle>{t('expenses.add.previewMissingTitle')}</CardTitle>
            <CardDescription>
              {t('expenses.add.previewMissingDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TmaHapticButton size='sm' variant='secondary'>
              <Link to={TMA_PATHS.expensesNewDetails}>
                {t('expenses.add.backToStep2Action')}
              </Link>
            </TmaHapticButton>
          </CardContent>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title={t('expenses.add.title')}>
      {feedback ? (
        <Card>
          <CardHeader>
            <CardDescription className='text-destructive'>
              {feedback}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className='grid gap-3'>
        <Card>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <TmaCategoryIconBadge
                accent={category.accent}
                iconUrl={category.iconUrl}
                symbol={category.symbol}
              />
              <div className='min-w-0 flex-1'>
                <CardTitle className='truncate'>{category.label}</CardTitle>
                <CardDescription>
                  {formatDateLabel(date)} ·{' '}
                  <span className='font-mono text-foreground [font-variant-numeric:tabular-nums]'>
                    {formatVnd(amount)}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='grid gap-2.5'>
            <Separator />
            <div className='grid gap-1'>
              <CardDescription>{t('expenses.add.expenseName')}</CardDescription>
              <p className='truncate text-base font-semibold text-foreground'>
                {title.trim() || t('expenses.add.nameUnset')}
              </p>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <SummaryRow
                label={t('expenses.add.source')}
                value={selectedSource?.label ?? t('expenses.add.sourceUnset')}
              />
              <SummaryRow
                label={t('expenses.add.contextHousehold')}
                value={
                  selectedHousehold?.name ?? t('expenses.add.contextPersonal')
                }
              />
              <SummaryRow
                label={t('expenses.add.contextGroup')}
                value={
                  selectedGroupItem
                    ? selectedGroupItem.group.name
                    : t('expenses.edit.optionUngrouped')
                }
              />
              <SummaryRow
                label={t('expenses.add.contextGroupLabel')}
                value={
                  selectedGroupItem
                    ? getGroupContextLabel(selectedGroupItem, t)
                    : t('expenses.add.contextPersonal')
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='grid gap-3'>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='add-expense-household-picker'>
                  {t('expenses.add.contextHousehold')}
                </FieldLabel>
                <NativePicker
                  fullWidth
                  aria-label={t('expenses.add.chooseHousehold')}
                  disabled={householdsQuery.isLoading}
                  id='add-expense-household-picker'
                  options={householdPickerOptions}
                  value={householdId ?? ''}
                  onChange={(next) => {
                    setContext({
                      householdId: next || null,
                      groupId,
                    })
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor='add-expense-group-picker'>
                  {t('expenses.add.contextGroup')}
                </FieldLabel>
                <NativePicker
                  fullWidth
                  aria-label={t('expenses.add.chooseGroup')}
                  disabled={personalGroupsQuery.isLoading}
                  id='add-expense-group-picker'
                  options={groupPickerOptions}
                  value={groupId ?? ''}
                  onChange={(next) => {
                    setContext({
                      householdId,
                      groupId: next || null,
                    })
                  }}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <TmaHapticButton
        aria-busy={createExpenseMutation.isPending}
        className='mt-5 mb-2 w-full'
        disabled={createExpenseMutation.isPending}
        onClick={() => {
          void handleSave()
        }}>
        {createExpenseMutation.isPending
          ? t('expenses.add.saving')
          : t('expenses.add.saveWithAmount', { amount: formatVnd(amount) })}
      </TmaHapticButton>
    </TmaPageShell>
  )
}
