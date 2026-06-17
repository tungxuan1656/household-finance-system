import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { SummaryRow } from '@/components/shared/summary-row'
import {
  TmaCategoryIconBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  buttonVariants,
  Card,
  CardDescription,
  CardTitle,
  Eyebrow,
  Field,
  FieldLabel,
  MoneyLabel,
  NativePicker,
} from '@/components/ui'
import { useCreateExpenseMutation } from '@/features/expenses/api'
import { useAddExpenseContextActions } from '@/features/expenses/hooks/use-add-expense-context-actions'
import { getSourceOptions } from '@/features/expenses/presentation'
import { useAddExpenseFlowStore } from '@/features/expenses/store'
import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '@/features/groups/api'
import { getGroupContextLabel } from '@/features/groups/presentation'
import type { GroupListItem } from '@/features/groups/types'
import { useHouseholdsQuery } from '@/features/home/api'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel, formatVnd } from '@/lib/formatters'
import {
  hideBottomButton,
  setBottomButton,
  updateBottomButton,
} from '@/lib/telegram/bottom-button'
import { selection } from '@/lib/telegram/haptics'

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

  useEffect(() => {
    if (!isReady) {
      return
    }

    const cleanup = setBottomButton({
      text: t('expenses.add.saveAction'),
      enabled: false,
      showProgress: false,
      onClick: () => {
        void handleSave()
      },
    })

    return cleanup
  }, [isReady, t])

  useEffect(() => {
    if (!isReady) {
      return
    }

    updateBottomButton({
      text: createExpenseMutation.isPending
        ? t('expenses.add.saving')
        : t('expenses.add.saveWithAmount', { amount: formatVnd(amount) }),
      enabled: !createExpenseMutation.isPending,
      showProgress: createExpenseMutation.isPending,
    })
  }, [amount, createExpenseMutation.isPending, isReady])

  useEffect(
    () => () => {
      hideBottomButton()
    },
    [],
  )

  if (!isReady || !category) {
    return (
      <TmaPageShell title={t('expenses.add.title')}>
        <TmaPageHeader
          eyebrow={t('expenses.add.step', { current: '3', total: '3' })}
          title={t('expenses.add.backToStep2')}
        />
        <Card className='grid gap-3'>
          <CardTitle>{t('expenses.add.previewMissingTitle')}</CardTitle>
          <CardDescription>
            {t('expenses.add.previewMissingDesc')}
          </CardDescription>
          <Link
            className={buttonVariants({ className: 'justify-self-start' })}
            to={TMA_PATHS.expensesNewDetails}>
            {t('expenses.add.backToStep2Action')}
          </Link>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell reserveBottomButton title={t('expenses.add.title')}>
      {feedback ? (
        <Card className='mb-3 border-[#d93838]/20 bg-[#ffeded]/90'>
          <CardDescription className='text-[#d93838]'>
            {feedback}
          </CardDescription>
        </Card>
      ) : null}

      <Card className='mb-3 grid gap-3 p-3.5'>
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
              <MoneyLabel>{formatVnd(amount)}</MoneyLabel>
            </CardDescription>
          </div>
        </div>

        <div className='grid gap-2.5 border-t border-tma-line pt-3'>
          <div className='grid gap-1'>
            <Eyebrow>{t('expenses.add.expenseName')}</Eyebrow>
            <strong className='truncate text-base font-semibold text-tma-text-strong'>
              {title.trim() || t('expenses.add.nameUnset')}
            </strong>
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
        </div>
      </Card>

      <Card className='grid gap-3'>
        <Field>
          <FieldLabel>{t('expenses.add.contextHousehold')}</FieldLabel>
          <NativePicker
            fullWidth
            aria-label={t('expenses.add.chooseHousehold')}
            disabled={householdsQuery.isLoading}
            options={householdPickerOptions}
            value={householdId ?? ''}
            onChange={(next) => {
              selection()

              setContext({
                householdId: next || null,
                groupId,
              })
            }}
          />
        </Field>
        <Field>
          <FieldLabel>{t('expenses.add.contextGroup')}</FieldLabel>
          <NativePicker
            fullWidth
            aria-label={t('expenses.add.chooseGroup')}
            disabled={personalGroupsQuery.isLoading}
            options={groupPickerOptions}
            value={groupId ?? ''}
            onChange={(next) => {
              selection()

              setContext({
                householdId,
                groupId: next || null,
              })
            }}
          />
        </Field>
      </Card>
    </TmaPageShell>
  )
}
