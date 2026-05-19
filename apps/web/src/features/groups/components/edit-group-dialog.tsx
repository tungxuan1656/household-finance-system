'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GroupForm } from '@/features/groups/components/group-form'
import type {
  CreateExpenseGroupRequest,
  ExpenseGroupDTO,
  UpdateExpenseGroupRequest,
} from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'

type EditGroupDialogProps = {
  group: ExpenseGroupDTO | null
  onOpenChange: (open: boolean) => void
  onSubmit: (
    values: CreateExpenseGroupRequest | UpdateExpenseGroupRequest,
  ) => void
  isSubmitting: boolean
}

export const EditGroupDialog = ({
  group,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditGroupDialogProps) => (
  <Dialog open={!!group} onOpenChange={onOpenChange}>
    <DialogContent className='sm:max-w-md' showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>{t('groups.edit.title')}</DialogTitle>
        <DialogDescription>{t('groups.edit.description')}</DialogDescription>
      </DialogHeader>
      {group && (
        <GroupForm
          householdId={group.householdId}
          initialValues={{
            name: group.name,
            description: group.description ?? undefined,
            startDate: group.startDate ?? undefined,
            endDate: group.endDate ?? undefined,
            eventBudget: group.eventBudgetMinor ?? undefined,
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
