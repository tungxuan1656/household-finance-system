'use client'

import { Plus, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { GroupForm } from '@/features/groups/components/group-form'
import type {
  CreateExpenseGroupRequest,
  UpdateExpenseGroupRequest,
} from '@/features/groups/types/group'
import { useIsMobile } from '@/hooks/shared/use-mobile'
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
}: CreateGroupDialogProps) => {
  const isMobile = useIsMobile()
  const trigger = (
    <Button type='button' variant='outline'>
      <Plus data-icon='inline-start' />
      {t('groups.actions.addNew')}
    </Button>
  )

  if (isMobile) {
    return (
      <Drawer direction='bottom' open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className='mx-auto grid w-full max-w-md grid-rows-[auto_1fr] overflow-hidden'>
          <DrawerHeader className='text-left'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0 flex-1'>
                <DrawerTitle>{t('groups.create.title')}</DrawerTitle>
                <DrawerDescription>
                  {t('groups.create.description')}
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
          <GroupForm
            className='overflow-y-auto overscroll-contain px-5'
            footerClassName='sticky bottom-0 -mx-5 border-t border-border/60 bg-popover/95 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur'
            householdId={householdId}
            isSubmitting={isSubmitting}
            mode='create'
            showCancelButton={false}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='sm:max-w-md' showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('groups.create.title')}</DialogTitle>
          <DialogDescription>
            {t('groups.create.description')}
          </DialogDescription>
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
}
