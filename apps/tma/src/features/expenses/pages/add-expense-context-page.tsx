import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
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
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatVnd } from '@/lib/formatters'

import { AddExpenseContextForm } from '../components/add-expense-context-form'
import { AddExpenseContextPreviewCard } from '../components/add-expense-context-preview-card'
import { useAddExpenseContext } from '../hooks/use-add-expense-context'

export const AddExpenseContextPage = () => {
  const {
    t,
    navigate,
    date,
    category,
    amount,
    title,
    householdId,
    groupId,
    householdsQuery,
    groupsQuery,
    createExpenseMutation,
    feedback,
    selectedSource,
    selectedHousehold,
    selectedGroup,
    selectedGroupLabel,
    isReady,
    householdPickerOptions,
    groupPickerOptions,
    setContext,
    handleSave,
  } = useAddExpenseContext()

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

      <AddExpenseContextPreviewCard
        amount={amount}
        category={category}
        date={date}
        selectedGroup={selectedGroup}
        selectedGroupLabel={selectedGroupLabel}
        selectedHousehold={selectedHousehold}
        selectedSource={selectedSource}
        t={t}
        title={title}
      />

      <AddExpenseContextForm
        groupId={groupId}
        groupPickerOptions={groupPickerOptions}
        groupsQuery={groupsQuery}
        householdId={householdId}
        householdPickerOptions={householdPickerOptions}
        householdsQuery={householdsQuery}
        setContext={setContext}
        t={t}
      />
    </TmaPageShell>
  )
}
