'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signOutCurrentSession } from '@/lib/auth/session-service'
import { t } from '@/lib/i18n/t'

export const AccountActionsCard = () => {
  const signOutDialogReference = useRef<ConfirmDialogHandle>(null)
  const deleteAccountDialogReference = useRef<ConfirmDialogHandle>(null)
  const [status, setStatus] = useState<string | null>(null)

  const handleSignOutConfirm = async () => {
    await signOutCurrentSession()
    setStatus(t('app.settings.accountActions.signOut.done'))
  }

  const handleDeleteConfirm = async () => {
    const message = t('app.settings.accountActions.delete.deferred')

    setStatus(message)
    toast(message)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('app.settings.accountActions.title')}</CardTitle>
        <CardDescription>
          {t('app.settings.accountActions.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={() => signOutDialogReference.current?.open()}>
          {t('common.actions.signOut')}
        </Button>
        <Button
          type='button'
          variant='destructive'
          onClick={() => deleteAccountDialogReference.current?.open()}>
          {t('common.actions.delete')}
        </Button>
        {status ? (
          <p
            aria-live='polite'
            className='text-sm text-muted-foreground'
            role='status'>
            {status}
          </p>
        ) : null}
        <ConfirmDialog
          ref={signOutDialogReference}
          cancelLabel={t('common.actions.cancel')}
          confirmLabel={t('common.actions.signOut')}
          description={t('app.settings.accountActions.signOut.description')}
          title={t('app.settings.accountActions.signOut.title')}
          onConfirm={handleSignOutConfirm}
        />
        <ConfirmDialog
          ref={deleteAccountDialogReference}
          cancelLabel={t('common.actions.cancel')}
          confirmLabel={t('common.actions.delete')}
          description={t('app.settings.accountActions.delete.description')}
          title={t('app.settings.accountActions.delete.title')}
          variant='destructive'
          onConfirm={handleDeleteConfirm}
        />
      </CardContent>
    </Card>
  )
}
