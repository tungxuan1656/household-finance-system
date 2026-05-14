'use client'

import { ArrowRight, LogOut, type LucideIcon, Trash2 } from 'lucide-react'
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
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  deleteCurrentUserAccount,
  signOutCurrentSession,
} from '@/lib/auth/session-service'
import { t } from '@/lib/i18n/t'

type ActionRowProps = {
  description: string
  Icon: LucideIcon
  title: string
  variant?: 'default' | 'destructive'
  onClick: () => void
}

const ActionRow = ({
  description,
  Icon,
  title,
  variant = 'default',
  onClick,
}: ActionRowProps) => (
  <Button
    className='h-auto w-full justify-between gap-3 rounded-2xl bg-muted/50 p-4 text-left hover:bg-muted'
    type='button'
    variant='ghost'
    onClick={onClick}>
    <span className='flex min-w-0 items-center gap-4'>
      <Icon
        aria-hidden='true'
        className={
          variant === 'destructive'
            ? 'mt-0.5 size-4 shrink-0 text-destructive'
            : 'mt-0.5 size-4 shrink-0 text-muted-foreground'
        }
      />
      <span className='flex min-w-0 flex-col gap-1'>
        <span
          className={
            variant === 'destructive'
              ? 'font-medium wrap-break-word whitespace-normal text-destructive'
              : 'font-medium wrap-break-word whitespace-normal'
          }>
          {title}
        </span>
        <span className='text-sm wrap-break-word whitespace-normal text-muted-foreground'>
          {description}
        </span>
      </span>
    </span>
    <ArrowRight
      aria-hidden='true'
      className='size-4 shrink-0 text-muted-foreground'
    />
  </Button>
)

export const AccountActionsCard = () => {
  const signOutDialogReference = useRef<ConfirmDialogHandle>(null)
  const deleteAccountDialogReference = useRef<ConfirmDialogHandle>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState('')

  const handleSignOutConfirm = async () => {
    await signOutCurrentSession()
    setStatus(t('app.settings.accountActions.signOut.done'))
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteCurrentUserAccount({ currentPassword: deletePassword })
      setDeletePassword('')

      const message = t('app.settings.accountActions.delete.done')

      setStatus(message)
      toast.success(message)
    } catch (error) {
      const message = t('app.settings.accountActions.delete.errors.failed')

      setStatus(message)
      toast.error(message)
      throw error
    }
  }

  const handleDeleteCancel = () => {
    setDeletePassword('')
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
        {/* danger zone rows keep account actions visually grouped. */}
        <ActionRow
          Icon={LogOut}
          description={t('app.settings.accountActions.signOut.rowDescription')}
          title={t('common.actions.signOut')}
          onClick={() => signOutDialogReference.current?.open()}
        />
        <ActionRow
          Icon={Trash2}
          description={t('app.settings.accountActions.delete.rowDescription')}
          title={t('app.settings.accountActions.delete.rowTitle')}
          variant='destructive'
          onClick={() => deleteAccountDialogReference.current?.open()}
        />
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
          confirmDisabled={!deletePassword.trim()}
          confirmLabel={t('common.actions.delete')}
          description={t('app.settings.accountActions.delete.description')}
          title={t('app.settings.accountActions.delete.title')}
          variant='destructive'
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}>
          <Field>
            <FieldLabel htmlFor='delete-account-password'>
              {t('app.settings.accountActions.delete.passwordLabel')}
            </FieldLabel>
            <Input
              autoComplete='current-password'
              id='delete-account-password'
              placeholder={t(
                'app.settings.profile.security.fields.currentPassword.placeholder',
              )}
              type='password'
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
            />
            <FieldDescription>
              {t('app.settings.accountActions.delete.passwordDescription')}
            </FieldDescription>
          </Field>
        </ConfirmDialog>
      </CardContent>
    </Card>
  )
}
