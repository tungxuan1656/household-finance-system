'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ApiClientError } from '@/api/client'
import {
  BudgetStatusPanel,
  BudgetSummaryCard,
  CreateBudgetDialog,
  EditBudgetDialog,
} from '@/components/budget'
import { BudgetList } from '@/components/budget/budget-list'
import {
  useBudgetListQuery,
  useBudgetStatusQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
} from '@/hooks/api/use-budgets'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'
import type {
  BudgetDTO,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '@/types/budget'

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
    (latest, budget) => {
      if (!latest) return budget

      return budget.period > latest.period ? budget : latest
    },
    null,
  )
  const { data: budgetStatus, isLoading: isStatusLoading } =
    useBudgetStatusQuery(latestBudget?.id)

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
    <div className='flex flex-col gap-6'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl tracking-tight'>
            {t('budgets.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('budgets.description')}
          </p>
        </div>
        {selectedHouseholdId && (
          <CreateBudgetDialog
            householdId={selectedHouseholdId}
            isSubmitting={createMutation.isPending}
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSubmit={handleCreate}
          />
        )}
      </header>

      {latestBudget && <BudgetSummaryCard budget={latestBudget} />}

      <BudgetStatusPanel
        isLoading={isStatusLoading}
        status={budgetStatus ?? null}
      />

      {selectedHouseholdId ? (
        <BudgetList
          householdId={selectedHouseholdId}
          onEdit={setEditingBudget}
        />
      ) : (
        <p className='text-sm text-muted-foreground'>
          {t('budgets.empty.description')}
        </p>
      )}

      <EditBudgetDialog
        budget={editingBudget}
        isSubmitting={updateMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setEditingBudget(null)
        }}
        onSubmit={handleUpdate}
      />
    </div>
  )
}

export { BudgetsPage }
