import { QueryState } from '@/components/shared/query-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageFooter, TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { BudgetManageCard } from '../components/budget-detail-manage-card'
import { BudgetStatusBlock } from '../components/budget-detail-status-block'
import { BudgetFeedbackCard } from '../components/budget-feedback-card'
import { BudgetHeroCard } from '../components/budget-hero-card'
import { useBudgetDetail } from '../hooks/use-budget-detail'
import type { BudgetDTO } from '../types'

export const BudgetDetailPage = () => {
  const {
    id,
    t,
    detailQuery,
    statusQuery,
    updateMutation,
    deleteMutation,
    status,
    households,
    household,
    feedback,
    isEditing,
    setIsEditing,
    totalLimitInput,
    setTotalLimitInput,
    canEdit,
    handleRefresh,
    handleDelete,
    handleSubmit,
    handleCancelEdit,
  } = useBudgetDetail()

  if (!id) {
    return (
      <TmaPageShell
        contentClassName='flex flex-col gap-4'
        title={t('budgets.detail.title')}>
        <Card size='sm'>
          <CardHeader>
            <CardTitle>{t('budgets.detail.invalidIdTitle')}</CardTitle>
            <CardDescription>
              {t('budgets.detail.invalidIdDesc')}
            </CardDescription>
          </CardHeader>
        </Card>
      </TmaPageShell>
    )
  }

  const showEditFooter = Boolean(canEdit && isEditing)

  return (
    <TmaPageShell
      contentClassName='flex flex-col gap-4'
      footer={
        showEditFooter ? (
          <TmaPageFooter>
            <TmaHapticButton
              disabled={updateMutation.isPending}
              type='button'
              variant='secondary'
              onClick={handleCancelEdit}>
              {t('common.cancel')}
            </TmaHapticButton>
            <TmaHapticButton
              aria-busy={updateMutation.isPending}
              disabled={updateMutation.isPending}
              form='budget-edit-form'
              type='submit'>
              {updateMutation.isPending
                ? t('budgets.detail.editing')
                : t('budgets.detail.save')}
            </TmaHapticButton>
          </TmaPageFooter>
        ) : undefined
      }
      title={t('budgets.detail.title')}
      onRefresh={handleRefresh}>
      <QueryState
        empty={{
          title: t('budgets.detail.notFoundTitle'),
          description: t('budgets.detail.notFoundDesc'),
        }}
        error={{
          title: t('budgets.detail.loadError'),
          description: t('budgets.detail.loadErrorDesc'),
        }}
        isEmpty={(data: BudgetDTO) => !data}
        pending={{
          title: t('budgets.detail.loading'),
          description: t('budgets.detail.loadingDesc'),
        }}
        query={detailQuery}
        retryAction={() => void detailQuery.refetch()}
        variant='card'>
        {(loadedBudget: BudgetDTO) => {
          const resolvedHousehold =
            households.find((entry) => entry.id === loadedBudget.householdId) ??
            household ??
            undefined

          return (
            <div className='flex flex-col gap-4'>
              {feedback ? <BudgetFeedbackCard feedback={feedback} /> : null}

              <BudgetHeroCard
                budget={loadedBudget}
                household={resolvedHousehold}
                status={status ?? undefined}
                t={t}
              />

              <BudgetStatusBlock statusQuery={statusQuery} t={t} />

              {canEdit ? (
                <BudgetManageCard
                  isDeletePending={deleteMutation.isPending}
                  isEditing={isEditing}
                  isUpdatePending={updateMutation.isPending}
                  t={t}
                  totalLimitInput={totalLimitInput}
                  onCancelEdit={handleCancelEdit}
                  onDelete={() => void handleDelete()}
                  onStartEdit={() => setIsEditing(true)}
                  onSubmit={handleSubmit}
                  onTotalLimitChange={setTotalLimitInput}
                />
              ) : null}
            </div>
          )
        }}
      </QueryState>
    </TmaPageShell>
  )
}
