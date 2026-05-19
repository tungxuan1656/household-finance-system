'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type {
  BudgetDTO,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '@/features/budgets/types/budget'
import { t } from '@/lib/i18n/t'

import { BudgetForm } from './budget-form'

type EditBudgetDialogProps = {
  budget: BudgetDTO | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateBudgetRequest | UpdateBudgetRequest) => void
  isSubmitting: boolean
}
function EditBudgetDialog({
  budget,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditBudgetDialogProps) {
  return (
    <Dialog open={!!budget} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md' showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('budgets.edit.title')}</DialogTitle>
          <DialogDescription>{t('budgets.edit.description')}</DialogDescription>
        </DialogHeader>
        {budget && (
          <BudgetForm
            householdId={budget.householdId}
            initialValues={{
              period: budget.period,
              totalLimit: budget.totalLimitMinor,
              categoryLimits: budget.categoryLimits,
            }}
            isSubmitting={isSubmitting}
            mode='edit'
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export { EditBudgetDialog }
