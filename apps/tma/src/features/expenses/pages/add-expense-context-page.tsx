import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { NativePicker } from '@/components/shared/native-picker'
import { QueryState } from '@/components/shared/query-state'
import { SummaryRow } from '@/components/shared/summary-row'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  TmaCategoryIconBadge,
  TmaPageFooter,
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
import { useExpenseGroupAggregateQuery } from '@/features/groups/api'
import { getGroupContextLabel } from '@/features/groups/presentation'
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
  const createExpenseMutation = useCreateExpenseMutation()
  const [feedback, setFeedback] = useState<string | null>(null)

  const households = useMemo(
    () => householdsQuery.data?.items ?? [],
    [householdsQuery.data?.items],
  )
  const groupsQuery = useExpenseGroupAggregateQuery(households)

  const groupItems = useMemo(() => {
    const items = groupsQuery.data?.items ?? []

    return [...items].sort((a, b) => b.createdAt - a.createdAt)
  }, [groupsQuery.data])

  const selectedSource =
    getSourceOptions(t).find((source) => source.id === sourceId) ?? null
  const selectedHousehold = households.find(
    (household) => household.id === householdId,
  )
  const selectedGroup = groupItems.find((g) => g.id === groupId) ?? null
  const selectedGroupHousehold = selectedGroup?.householdId
    ? (households.find((h) => h.id === selectedGroup.householdId) ?? null)
    : null
  const selectedGroupLabel = selectedGroup
    ? getGroupContextLabel(
        { group: selectedGroup, household: selectedGroupHousehold },
        t,
      )
    : null
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
        value: item.id,
        label: item.name,
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
      <TmaPageShell contentClassName='gap-4' title={t('expenses.add.title')}>
        <TmaPageHeader
          eyebrow={t('expenses.add.step', { current: '3', total: '3' })}
          subtitle={t('expenses.add.contextHint', {
            defaultValue: 'Chọn nơi lưu khoản chi này',
          })}
          title={t('expenses.add.contextTitle', {
            defaultValue: 'Bối cảnh',
          })}
        />
        <Card size='sm'>
          <CardHeader>
            <CardTitle>{t('expenses.add.previewMissingTitle')}</CardTitle>
            <CardDescription>
              {t('expenses.add.previewMissingDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TmaHapticButton
              size='sm'
              variant='secondary'
              onClick={() => navigate(TMA_PATHS.expensesNewDetails)}>
              {t('expenses.add.backToStep2Action')}
            </TmaHapticButton>
          </CardContent>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell
      contentClassName='gap-4'
      footer={
        <TmaPageFooter>
          <TmaHapticButton
            aria-busy={createExpenseMutation.isPending}
            className='w-full'
            disabled={createExpenseMutation.isPending}
            onClick={() => {
              void handleSave()
            }}>
            {createExpenseMutation.isPending
              ? t('expenses.add.saving')
              : t('expenses.add.saveWithAmount', { amount: formatVnd(amount) })}
          </TmaHapticButton>
        </TmaPageFooter>
      }
      title={t('expenses.add.title')}>
      <TmaPageHeader
        eyebrow={t('expenses.add.step', { current: '3', total: '3' })}
        subtitle={t('expenses.add.contextHint', {
          defaultValue: 'Chọn nơi lưu khoản chi này',
        })}
        title={t('expenses.add.contextTitle', {
          defaultValue: 'Bối cảnh',
        })}
      />

      {feedback ? (
        <Card className='border-destructive/30' role='alert' size='sm'>
          <CardHeader>
            <CardDescription className='text-destructive'>
              {feedback}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card size='sm'>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-3'>
            <TmaCategoryIconBadge
              accent={category.accent}
              iconUrl={category.iconUrl}
              symbol={category.symbol}
            />
            <div className='min-w-0 flex-1'>
              <CardTitle className='truncate'>{category.label}</CardTitle>
              <CardDescription className='truncate'>
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
          <div className='grid min-w-0 gap-1'>
            <CardDescription>{t('expenses.add.expenseName')}</CardDescription>
            <p className='truncate text-base font-semibold text-foreground'>
              {title.trim() || t('expenses.add.nameUnset')}
            </p>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='min-w-0 [&_strong]:block [&_strong]:truncate'>
              <SummaryRow
                label={t('expenses.add.source')}
                value={selectedSource?.label ?? t('expenses.add.sourceUnset')}
              />
            </div>
            <div className='min-w-0 [&_strong]:block [&_strong]:truncate'>
              <SummaryRow
                label={t('expenses.add.contextHousehold')}
                value={
                  selectedHousehold?.name ?? t('expenses.add.contextPersonal')
                }
              />
            </div>
            <div className='min-w-0 [&_strong]:block [&_strong]:truncate'>
              <SummaryRow
                label={t('expenses.add.contextGroup')}
                value={
                  selectedGroup
                    ? selectedGroup.name
                    : t('expenses.edit.optionUngrouped')
                }
              />
            </div>
            <div className='min-w-0 [&_strong]:block [&_strong]:truncate'>
              <SummaryRow
                label={t('expenses.add.contextGroupLabel')}
                value={selectedGroupLabel ?? t('expenses.add.contextPersonal')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card size='sm'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm tracking-normal normal-case'>
            {t('expenses.add.contextSectionTitle', {
              defaultValue: 'Bối cảnh lưu trữ',
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className='gap-5'>
            <QueryState
              error={{
                title: t('dataState.errorTitle'),
                description: t('dataState.errorDescription'),
              }}
              isEmpty={false}
              pending={{ title: t('common.loading') }}
              query={householdsQuery}
              retryAction={() => void householdsQuery.refetch()}
              variant='plain'>
              {() => (
                <Field>
                  <FieldLabel htmlFor='add-expense-household-picker'>
                    {t('expenses.add.contextHousehold')}
                  </FieldLabel>
                  <NativePicker
                    fullWidth
                    aria-label={t('expenses.add.chooseHousehold')}
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
              )}
            </QueryState>

            <QueryState
              error={{
                title: t('dataState.errorTitle'),
                description: t('dataState.errorDescription'),
              }}
              isEmpty={false}
              pending={{ title: t('common.loading') }}
              query={groupsQuery}
              retryAction={() => void groupsQuery.refetch?.()}
              variant='plain'>
              {() => (
                <Field>
                  <FieldLabel htmlFor='add-expense-group-picker'>
                    {t('expenses.add.contextGroup')}
                  </FieldLabel>
                  <NativePicker
                    fullWidth
                    aria-label={t('expenses.add.chooseGroup')}
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
              )}
            </QueryState>
          </FieldGroup>
        </CardContent>
      </Card>
    </TmaPageShell>
  )
}
