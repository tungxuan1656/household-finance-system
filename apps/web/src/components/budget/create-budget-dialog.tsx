'use client'

import { Plus } from 'lucide-react'

import { BudgetForm } from '@/components/budget/budget-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { t } from '@/lib/i18n/t'
import type { CreateBudgetRequest, UpdateBudgetRequest } from '@/types/budget'

type CreateBudgetDialogProps = {
  householdId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateBudgetRequest | UpdateBudgetRequest) => void
  isSubmitting: boolean
}

function CreateBudgetDialog({
  householdId,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateBudgetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type='button' variant='outline'>
          <Plus data-icon='inline-start' />
          {t('budgets.actions.addNew')}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md' showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('budgets.create.title')}</DialogTitle>
          <DialogDescription>
            {t('budgets.create.description')}
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          householdId={householdId}
          isSubmitting={isSubmitting}
          mode='create'
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

export { CreateBudgetDialog }
