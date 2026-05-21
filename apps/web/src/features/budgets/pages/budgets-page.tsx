'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ApiClientError } from '@/api/client'
import { DataState } from '@/components/shared/data-state'
import { PageShell } from '@/components/ui/page-shell'
import {
  BudgetList,
  BudgetStatusPanel,
  BudgetSummaryCard,
  CreateBudgetDialog,
  EditBudgetDialog,
} from '@/features/budgets/components'
import {
  useBudgetListQuery,
  useBudgetStatusQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
} from '@/features/budgets/hooks/use-budgets'
import type {
  BudgetDTO,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '@/features/budgets/types/budget'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

function BudgetsPage() {
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const households = useHouseholdStore.use.households()
  const selectedHouseholdId = currentHousehold?.id ?? households[0]?.id

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetDTO | null>(null)

  const createMutation = useCreateBudgetMutation()
  const updateMutation = useUpdateBudgetMutation()
  const { data: budgetsData } = useBudgetListQuery(selectedHouseholdId)
  const latestBudget = budgetsData?.items.reduce<BudgetDTO | null>(
    (latest, budget) =>
      !latest || budget.period > latest.period ? budget : latest,
    null,
  )
  const {
    data: budgetStatus,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchBudgetStatus,
  } = useBudgetStatusQuery(latestBudget?.id)

  useEffect(() => {
    if (households.length === 0) {
      void householdActions.fetchHouseholds()
    }
  }, [households.length])

  const handleCreate = async (
    values: CreateBudgetRequest | UpdateBudgetRequest,
  ) => {
    try {
      await createMutation.mutateAsync(values as CreateBudgetRequest)
      toast.success(t('budgets.feedback.createSuccess'))
      setIsCreateDialogOpen(false)
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        toast.error(t('budgets.feedback.duplicatePeriod'))

        return
      }

      toast.error(t('budgets.feedback.createFailed'))
    }
  }

  const handleUpdate = async (values: UpdateBudgetRequest) => {
    if (!editingBudget) return
    try {
      await updateMutation.mutateAsync({
        id: editingBudget.id,
        payload: values,
      })

      toast.success(t('budgets.feedback.updateSuccess'))
      setEditingBudget(null)
    } catch {
      toast.error(t('budgets.feedback.updateFailed'))
    }
  }

  return (
    <PageShell title={t('budgets.title')}>
      <div className='flex flex-col gap-4 md:gap-6'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <p className='text-sm text-muted-foreground'>
            {t('budgets.description')}
          </p>
          <div>
            {selectedHouseholdId && (
              <CreateBudgetDialog
                householdId={selectedHouseholdId}
                isSubmitting={createMutation.isPending}
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSubmit={handleCreate}
              />
            )}
          </div>
        </div>

        <DataState
          emptyDescription={t('budgets.empty.description')}
          emptyTitle={t('budgets.empty.title')}
          isEmpty={!selectedHouseholdId}>
          {selectedHouseholdId ? (
            <>
              {latestBudget && <BudgetSummaryCard budget={latestBudget} />}

              <BudgetStatusPanel
                errorMessage={
                  statusError ? 'budgets.status.error.loadFailed' : null
                }
                isLoading={isStatusLoading}
                status={budgetStatus ?? null}
                onRetry={() => void refetchBudgetStatus()}
              />

              <BudgetList
                householdId={selectedHouseholdId}
                onEdit={setEditingBudget}
              />
            </>
          ) : null}
        </DataState>

        <EditBudgetDialog
          budget={editingBudget}
          isSubmitting={updateMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setEditingBudget(null)
          }}
          onSubmit={handleUpdate}
        />
      </div>
    </PageShell>
  )
}

export { BudgetsPage }
