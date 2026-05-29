'use client'

import { useEffect, useRef } from 'react'

import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/shared/confirm-dialog'
import type { ExpenseGroupDTO } from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'

type ArchiveGroupDialogProps = {
  group: ExpenseGroupDTO | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isSubmitting: boolean
}

export const ArchiveGroupDialog = ({
  group,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: ArchiveGroupDialogProps) => {
  const dialogRef = useRef<ConfirmDialogHandle>(null)
  const prevGroupRef = useRef(group)

  useEffect(() => {
    if (group && !prevGroupRef.current) {
      dialogRef.current?.open()
    }
    prevGroupRef.current = group
  }, [group])

  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleConfirm = async () => {
    await onConfirm()
  }

  if (!group) {
    return null
  }

  return (
    <ConfirmDialog
      ref={dialogRef}
      confirmLabel={
        isSubmitting
          ? t('groups.actions.archiving')
          : t('groups.actions.archive')
      }
      confirmLoading={isSubmitting}
      description={t('groups.archive.description')}
      title={t('groups.archive.title')}
      variant='destructive'
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  )
}
