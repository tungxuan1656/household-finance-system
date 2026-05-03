'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  ArchiveGroupDialog,
  CreateGroupDialog,
  EditGroupDialog,
} from '@/components/group'
import { GroupList } from '@/components/group/group-list'
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
    if (!editingGroup) return
    try {
      await updateMutation.mutateAsync({ id: editingGroup.id, payload: values })
      toast.success(t('groups.feedback.updateSuccess'))
      setEditingGroup(null)
    } catch {
      toast.error(t('groups.feedback.updateFailed'))
    }
  }

  const handleArchive = async () => {
    if (!archivingGroup) return
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
          <CreateGroupDialog
            householdId={selectedHouseholdId}
            isSubmitting={createMutation.isPending}
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSubmit={handleCreate}
          />
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

      <EditGroupDialog
        group={editingGroup}
        isSubmitting={updateMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setEditingGroup(null)
        }}
        onSubmit={handleUpdate}
      />

      <ArchiveGroupDialog
        group={archivingGroup}
        isSubmitting={archiveMutation.isPending}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchivingGroup(null)
        }}
      />
    </div>
  )
}

export { GroupsPage }
