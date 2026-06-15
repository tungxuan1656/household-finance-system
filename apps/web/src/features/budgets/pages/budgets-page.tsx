'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ApiClientError } from '@/api/client'
import { DataState } from '@/components/shared/data-state'
import {
  PageContainer,
  PageContent,
  PageHeader,
} from '@/components/shared/page'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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
  useDeleteBudgetMutation,
  useUpdateBudgetMutation,
} from '@/features/budgets/hooks/use-budgets'
import type {
  BudgetDTO,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '@/features/budgets/types/budget'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

type ScopeFilter = 'all' | 'household' | 'personal'

function BudgetsPage() {
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const households = useHouseholdStore.use.households()
  const selectedHouseholdId = currentHousehold?.id ?? households[0]?.id

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null)
  const [editingBudget, setEditingBudget] = useState<BudgetDTO | null>(null)

  const createMutation = useCreateBudgetMutation()
  const deleteMutation = useDeleteBudgetMutation()
  const updateMutation = useUpdateBudgetMutation()

  const listParams =
    scopeFilter === 'household'
      ? { householdId: selectedHouseholdId, scope: 'household' as const }
      : scopeFilter === 'personal'
        ? { scope: 'personal' as const }
        : {}

  const { data: budgetsData } = useBudgetListQuery(listParams)
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

  const handleDelete = async (budget: BudgetDTO) => {
    try {
      setDeletingBudgetId(budget.id)
      await deleteMutation.mutateAsync(budget.id)

      if (editingBudget?.id === budget.id) {
        setEditingBudget(null)
      }

      toast.success(t('budgets.feedback.deleteSuccess'))
    } catch {
      toast.error(t('budgets.feedback.deleteFailed'))
      throw new Error('Delete budget failed')
    } finally {
      setDeletingBudgetId((currentId) =>
        currentId === budget.id ? null : currentId,
      )
    }
  }

  const canCreateBudget =
    scopeFilter === 'personal' || scopeFilter === 'all' || !!selectedHouseholdId
  const createDialogHouseholdId =
    scopeFilter === 'household' ? (selectedHouseholdId ?? null) : null

  const isEmpty = !budgetsData || budgetsData.items.length === 0

  const emptyTitle =
    scopeFilter === 'personal'
      ? t('budgets.empty.personalTitle')
      : t('budgets.empty.title')
  const emptyDescription =
    scopeFilter === 'personal'
      ? t('budgets.empty.personalDescription')
      : t('budgets.empty.description')

  return (
    <PageContainer>
      <PageHeader showBack title={t('budgets.title')} />
      <PageContent>
        <div className='flex flex-col gap-4 md:gap-6'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <p className='text-sm text-muted-foreground'>
              {t('budgets.description')}
            </p>
            <div>
              {canCreateBudget && (
                <CreateBudgetDialog
                  householdId={createDialogHouseholdId}
                  isSubmitting={createMutation.isPending}
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                  onSubmit={handleCreate}
                />
              )}
            </div>
          </div>

          <ToggleGroup
            spacing={0}
            type='single'
            value={scopeFilter}
            variant='outline'
            onValueChange={(value) => {
              if (value) setScopeFilter(value as ScopeFilter)
            }}>
            <ToggleGroupItem value='all'>
              {t('budgets.scopeFilter.all')}
            </ToggleGroupItem>
            <ToggleGroupItem value='household'>
              {t('budgets.scopeFilter.household')}
            </ToggleGroupItem>
            <ToggleGroupItem value='personal'>
              {t('budgets.scopeFilter.personal')}
            </ToggleGroupItem>
          </ToggleGroup>

          <DataState
            emptyDescription={emptyDescription}
            emptyTitle={emptyTitle}
            isEmpty={
              scopeFilter === 'household' && !selectedHouseholdId
                ? true
                : isEmpty
            }>
            {scopeFilter === 'household' && !selectedHouseholdId ? null : (
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
                  deletingBudgetId={deletingBudgetId}
                  householdId={
                    scopeFilter === 'household'
                      ? selectedHouseholdId
                      : undefined
                  }
                  scope={
                    scopeFilter === 'personal'
                      ? 'personal'
                      : scopeFilter === 'household'
                        ? 'household'
                        : undefined
                  }
                  onDelete={handleDelete}
                  onEdit={setEditingBudget}
                />
              </>
            )}
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
      </PageContent>
    </PageContainer>
  )
}

export { BudgetsPage }
