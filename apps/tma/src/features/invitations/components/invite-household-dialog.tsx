import { shareURL } from '@tma.js/sdk'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  Field,
  FieldLabel,
  NativePicker,
  type NativePickerOption,
} from '@/components/ui'
import { useCreateInvitationMutation } from '@/features/invitations/api/invitation'
import type {
  InvitationRoleDTO,
  InvitationTtlHours,
} from '@/features/invitations/types/invitation'
import { impact, notification } from '@/lib/telegram/haptics'

type InviteHouseholdDialogProps = {
  householdId: string
  householdName: string
  onClose: () => void
}

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as
  | string
  | undefined

export const InviteHouseholdDialog = ({
  householdId,
  householdName,
  onClose,
}: InviteHouseholdDialogProps) => {
  const { t } = useTranslation()
  const [role, setRole] = useState<InvitationRoleDTO>('member')
  const [ttlHours, setTtlHours] = useState<InvitationTtlHours>(72)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const createMutation = useCreateInvitationMutation()

  const roleOptions: NativePickerOption[] = [
    { label: t('invitations.roleMember'), value: 'member' },
    { label: t('invitations.roleAdmin'), value: 'admin' },
  ]

  const ttlOptions: NativePickerOption[] = [
    { label: t('invitations.ttl24h'), value: '24' },
    { label: t('invitations.ttl72h'), value: '72' },
    { label: t('invitations.ttl7d'), value: '168' },
  ]

  const handleCreate = async () => {
    try {
      const result = await createMutation.mutateAsync({
        householdId,
        payload: { role, ttlHours },
      })

      const deepLink = BOT_USERNAME
        ? `https://t.me/${BOT_USERNAME}?startapp=${result.token}`
        : result.invitePath

      setInviteLink(deepLink)
      impact('medium')
    } catch {
      notification('error')
    }
  }

  const handleShareViaTelegram = () => {
    if (!inviteLink) return
    impact('light')
    try {
      // shareURL from @tma.js/sdk returns void, not a Promise.
      // Wrap in Promise.resolve to keep the call site uniform with handleCopyLink.
      Promise.resolve(
        shareURL(inviteLink, t('invitations.shareText', { householdName })),
      ).catch(() => {
        // Fallback: copy to clipboard if share fails
        void navigator.clipboard.writeText(inviteLink)
        notification('success')
      })
    } catch {
      void navigator.clipboard.writeText(inviteLink)
      notification('success')
    }
  }

  const handleCopyLink = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      impact('light')
      notification('success')
    } catch {
      notification('error')
    }
  }

  const handleClose = () => {
    impact('light')
    onClose()
  }

  return (
    <Card className='mt-3'>
      <CardTitle>{t('invitations.inviteTitle')}</CardTitle>
      <CardDescription>
        {t('invitations.inviteDesc', { householdName })}
      </CardDescription>

      <CardContent className='mt-3'>
        {!inviteLink ? (
          <>
            <Field>
              <FieldLabel>{t('invitations.roleLabel')}</FieldLabel>
              <NativePicker
                aria-label={t('invitations.roleLabel')}
                options={roleOptions}
                value={role}
                onChange={(v) => setRole(v as InvitationRoleDTO)}
              />
            </Field>

            <Field className='mt-3'>
              <FieldLabel>{t('invitations.ttlLabel')}</FieldLabel>
              <NativePicker
                aria-label={t('invitations.ttlLabel')}
                options={ttlOptions}
                value={String(ttlHours)}
                onChange={(v) => setTtlHours(Number(v) as InvitationTtlHours)}
              />
            </Field>

            <div className='mt-4 flex gap-2'>
              <Button
                disabled={createMutation.isPending}
                size='md'
                variant='primary'
                onClick={handleCreate}>
                {createMutation.isPending
                  ? t('invitations.creating')
                  : t('invitations.createInvite')}
              </Button>
              <Button size='md' variant='ghost' onClick={handleClose}>
                {t('common.cancel')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className='m-0 text-sm text-tma-text-strong'>
              {t('invitations.linkReady')}
            </p>

            <div className='mt-2 rounded-2xl border border-tma-line bg-black/4 p-3'>
              <p className='m-0 font-mono text-xs break-all text-tma-text-muted'>
                {inviteLink}
              </p>
            </div>

            <div className='mt-4 flex gap-2'>
              <Button
                size='md'
                variant='primary'
                onClick={handleShareViaTelegram}>
                {t('invitations.shareViaTelegram')}
              </Button>
              <Button size='md' variant='outline' onClick={handleCopyLink}>
                {t('invitations.copyLink')}
              </Button>
            </div>

            <Button
              className='mt-2'
              size='sm'
              variant='ghost'
              onClick={handleClose}>
              {t('common.close')}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
