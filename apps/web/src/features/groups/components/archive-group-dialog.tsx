'use client'

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
}: ArchiveGroupDialogProps) => (
  <AlertDialog open={!!group} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{t('groups.archive.title')}</AlertDialogTitle>
        <AlertDialogDescription>
          {t('groups.archive.description')}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isSubmitting}>
          {t('common.actions.cancel')}
        </AlertDialogCancel>
        <AlertDialogAction
          disabled={isSubmitting}
          onClick={(e) => {
            e.preventDefault()
            onConfirm()
          }}>
          {isSubmitting
            ? t('groups.actions.archiving')
            : t('groups.actions.archive')}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
