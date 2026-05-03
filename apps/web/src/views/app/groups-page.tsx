'use client'

import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { GroupForm } from '@/components/group/group-form'
import { GroupList } from '@/components/group/group-list'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  useArchiveExpenseGroupMutation,
  useCreateExpenseGroupMutation,
  useUpdateExpenseGroupMutation,
} from '@/hooks/api/use-groups'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'
import type {
  CreateExpenseGroupRequest,
  ExpenseGroupDTO,
  UpdateExpenseGroupRequest,
} from '@/types/group'

function GroupsPage() {
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const households = useHouseholdStore.use.households()
  const selectedHouseholdId = currentHousehold?.id ?? households[0]?.id

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ExpenseGroupDTO | null>(null)
  const [archivingGroup, setArchivingGroup] = useState<ExpenseGroupDTO | null>(
    null,
  )

  const createMutation = useCreateExpenseGroupMutation()
  const updateMutation = useUpdateExpenseGroupMutation()
  const archiveMutation = useArchiveExpenseGroupMutation()

  useEffect(() => {
    if (households.length === 0) {
      void householdActions.fetchHouseholds()
    }
  }, [households.length])

  const handleCreate = async (
    values: CreateExpenseGroupRequest | UpdateExpenseGroupRequest,
  ) => {
    try {
      await createMutation.mutateAsync(values as CreateExpenseGroupRequest)

      toast.success(t('groups.feedback.createSuccess'))
      setIsCreateDialogOpen(false)
    } catch {
      toast.error(t('groups.feedback.createFailed'))
    }
  }

  const handleUpdate = async (values: UpdateExpenseGroupRequest) => {
    if (!editingGroup) {
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: editingGroup.id,
        payload: values,
      })

      toast.success(t('groups.feedback.updateSuccess'))
      setEditingGroup(null)
    } catch {
      toast.error(t('groups.feedback.updateFailed'))
    }
  }

  const handleArchive = async () => {
    if (!archivingGroup) {
      return
    }

    try {
      await archiveMutation.mutateAsync(archivingGroup.id)
      toast.success(t('groups.feedback.archiveSuccess'))
      setArchivingGroup(null)
    } catch {
      toast.error(t('groups.feedback.archiveFailed'))
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl tracking-tight'>
            {t('groups.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('groups.description')}
          </p>
        </div>
        {selectedHouseholdId && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button type='button' variant='outline'>
                <Plus data-icon='inline-start' />
                {t('groups.actions.addNew')}
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md' showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>{t('groups.create.title')}</DialogTitle>
                <DialogDescription>
                  {t('groups.create.description')}
                </DialogDescription>
              </DialogHeader>
              <GroupForm
                householdId={selectedHouseholdId}
                isSubmitting={createMutation.isPending}
                mode='create'
                onCancel={() => setIsCreateDialogOpen(false)}
                onSubmit={handleCreate}
              />
            </DialogContent>
          </Dialog>
        )}
      </header>

      {selectedHouseholdId ? (
        <GroupList
          householdId={selectedHouseholdId}
          onArchive={setArchivingGroup}
          onEdit={setEditingGroup}
        />
      ) : (
        <p className='text-sm text-muted-foreground'>
          {t('groups.empty.description')}
        </p>
      )}

      <Dialog
        open={!!editingGroup}
        onOpenChange={(open) => {
          if (!open) {
            setEditingGroup(null)
          }
        }}>
        <DialogContent className='sm:max-w-md' showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t('groups.edit.title')}</DialogTitle>
            <DialogDescription>
              {t('groups.edit.description')}
            </DialogDescription>
          </DialogHeader>
          {editingGroup && (
            <GroupForm
              householdId={editingGroup.householdId}
              initialValues={{
                name: editingGroup.name,
                description: editingGroup.description ?? undefined,
                startDate: editingGroup.startDate ?? undefined,
                endDate: editingGroup.endDate ?? undefined,
                eventBudget: editingGroup.eventBudgetMinor ?? undefined,
              }}
              isSubmitting={updateMutation.isPending}
              mode='edit'
              onCancel={() => setEditingGroup(null)}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!archivingGroup}
        onOpenChange={(open) => {
          if (!open) {
            setArchivingGroup(null)
          }
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('groups.archive.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('groups.archive.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveMutation.isPending}>
              {t('common.actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={archiveMutation.isPending}
              onClick={(e) => {
                e.preventDefault()
                void handleArchive()
              }}>
              {archiveMutation.isPending
                ? t('groups.actions.archiving')
                : t('groups.actions.archive')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { GroupsPage }
