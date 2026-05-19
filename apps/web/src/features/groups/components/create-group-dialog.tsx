'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { GroupForm } from '@/features/groups/components/group-form'
import type {
  CreateExpenseGroupRequest,
  UpdateExpenseGroupRequest,
} from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'

type CreateGroupDialogProps = {
  householdId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (
    values: CreateExpenseGroupRequest | UpdateExpenseGroupRequest,
  ) => void
  isSubmitting: boolean
}

export const CreateGroupDialog = ({
  householdId,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateGroupDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button type='button' variant='outline'>
        <Plus data-icon='inline-start' />
        {t('groups.actions.addNew')}
      </Button>
    </DialogTrigger>
    <DialogContent className='sm:max-w-md' showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>{t('groups.create.title')}</DialogTitle>
        <DialogDescription>{t('groups.create.description')}</DialogDescription>
      </DialogHeader>
      <GroupForm
        householdId={householdId}
        isSubmitting={isSubmitting}
        mode='create'
        onCancel={() => onOpenChange(false)}
        onSubmit={onSubmit}
      />
    </DialogContent>
  </Dialog>
)
