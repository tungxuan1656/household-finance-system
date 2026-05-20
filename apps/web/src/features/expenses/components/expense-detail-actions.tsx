'use client'

import { Button } from '@/components/ui/button'
import { t } from '@/lib/i18n/t'

import type { ExpenseDTO } from '../types/expense'

type ExpenseDetailActionsProps = {
  expense: ExpenseDTO
  currentUserId?: string
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}

export const ExpenseDetailActions = ({
  expense,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
  isDeleting,
}: ExpenseDetailActionsProps) => {
  const canManageExpense = currentUserId === expense.createdByUserId || isAdmin

  if (!canManageExpense) {
    return null
  }

  const handleDelete = () => {
    if (!window.confirm(t('expense.deleteConfirm'))) {
      return
    }
    onDelete()
  }

  return (
    <div className='flex items-center gap-2'>
      <Button size='sm' type='button' variant='outline' onClick={onEdit}>
        {t('expense.editAction')}
      </Button>
      <Button
        disabled={isDeleting}
        size='sm'
        type='button'
        variant='destructive'
        onClick={handleDelete}>
        {t('expense.deleteAction')}
      </Button>
    </div>
  )
}
