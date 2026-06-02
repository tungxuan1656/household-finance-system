'use client'

import { XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { GroupForm } from '@/features/groups/components/group-form'
import type {
  CreateExpenseGroupRequest,
  ExpenseGroupDTO,
  UpdateExpenseGroupRequest,
} from '@/features/groups/types/group'
import { useIsMobile } from '@/hooks/shared/use-mobile'
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
}: EditGroupDialogProps) => {
  const isMobile = useIsMobile()

  const form = group ? (
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
  ) : null

  if (isMobile) {
    return (
      <Drawer direction='bottom' open={!!group} onOpenChange={onOpenChange}>
        <DrawerContent className='mx-auto grid w-full max-w-md grid-rows-[auto_1fr] overflow-hidden'>
          <DrawerHeader className='text-left'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0 flex-1'>
                <DrawerTitle>{t('groups.edit.title')}</DrawerTitle>
                <DrawerDescription>
                  {t('groups.edit.description')}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button
                  aria-label={t('common.actions.close')}
                  size='icon'
                  type='button'
                  variant='ghost'
                  onClick={() => onOpenChange(false)}>
                  <XIcon className='size-4' />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          {group ? (
            <GroupForm
              className='overflow-y-auto overscroll-contain px-5'
              footerClassName='sticky bottom-0 -mx-5 border-t border-border/60 bg-popover/95 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur'
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
              showCancelButton={false}
              onCancel={() => onOpenChange(false)}
              onSubmit={onSubmit}
            />
          ) : null}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={!!group} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md' showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('groups.edit.title')}</DialogTitle>
          <DialogDescription>{t('groups.edit.description')}</DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  )
}
