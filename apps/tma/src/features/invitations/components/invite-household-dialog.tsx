import { shareURL } from '@tma.js/sdk'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  NativePicker,
  type NativePickerOption,
} from '@/components/shared/native-picker'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
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

const INVITATION_TTL_VALUES: readonly InvitationTtlHours[] = [24, 72, 168]

const isInvitationRole = (value: string): value is InvitationRoleDTO =>
  value === 'admin' || value === 'member'

const parseInvitationTtlHours = (value: string): InvitationTtlHours => {
  const parsed = Number(value)
  if (INVITATION_TTL_VALUES.includes(parsed as InvitationTtlHours)) {
    return parsed as InvitationTtlHours
  }

  return 72
}

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

  // shareURL from @tma.js/sdk is fire-and-forget (returns void synchronously).
  // Cancellation or unavailability is not observable, so the explicit "Copy link"
  // button is the user-visible fallback for sharing.
  const handleShareViaTelegram = () => {
    if (!inviteLink) return
    shareURL(inviteLink, t('invitations.shareText', { householdName }))
  }

  const handleCopyLink = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      notification('success')
    } catch {
      notification('error')
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Card className='mt-3 p-4'>
      <CardTitle>{t('invitations.inviteTitle')}</CardTitle>
      <CardDescription>
        {t('invitations.inviteDesc', { householdName })}
      </CardDescription>

      <CardContent className='mt-3 px-0'>
        {!inviteLink ? (
          <>
            <Field>
              <FieldLabel htmlFor='invitation-role-picker'>
                {t('invitations.roleLabel')}
              </FieldLabel>
              <NativePicker
                aria-label={t('invitations.roleLabel')}
                id='invitation-role-picker'
                options={roleOptions}
                value={role}
                onChange={(v) => {
                  if (isInvitationRole(v)) setRole(v)
                }}
              />
              {role === 'admin' ? (
                <p className='mt-1 text-xs font-semibold text-amber-700'>
                  {t('invitations.adminRoleWarning')}
                </p>
              ) : null}
            </Field>

            <Field className='mt-3'>
              <FieldLabel htmlFor='invitation-ttl-picker'>
                {t('invitations.ttlLabel')}
              </FieldLabel>
              <NativePicker
                aria-label={t('invitations.ttlLabel')}
                id='invitation-ttl-picker'
                options={ttlOptions}
                value={String(ttlHours)}
                onChange={(v) => setTtlHours(parseInvitationTtlHours(v))}
              />
            </Field>

            <div className='mt-4 flex gap-2'>
              <TmaHapticButton
                aria-busy={createMutation.isPending}
                disabled={createMutation.isPending}
                size='default'
                variant='default'
                onClick={handleCreate}>
                {createMutation.isPending
                  ? t('invitations.creating')
                  : t('invitations.createInvite')}
              </TmaHapticButton>
              <TmaHapticButton
                size='default'
                variant='ghost'
                onClick={handleClose}>
                {t('common.cancel')}
              </TmaHapticButton>
            </div>
          </>
        ) : (
          <>
            <p className='m-0 text-sm text-foreground'>
              {t('invitations.linkReady')}
            </p>

            <div className='mt-2 rounded-2xl border border-border bg-border p-3'>
              <p className='m-0 line-clamp-1 font-mono text-xs break-all text-muted-foreground'>
                {inviteLink}
              </p>
            </div>

            <div className='mt-4 flex gap-2'>
              <TmaHapticButton
                size='default'
                variant='default'
                onClick={handleShareViaTelegram}>
                {t('invitations.shareViaTelegram')}
              </TmaHapticButton>
              <TmaHapticButton
                size='default'
                variant='outline'
                onClick={handleCopyLink}>
                {t('invitations.copyLink')}
              </TmaHapticButton>
            </div>

            <TmaHapticButton
              className='mt-2'
              size='sm'
              variant='ghost'
              onClick={handleClose}>
              {t('common.close')}
            </TmaHapticButton>
          </>
        )}
      </CardContent>
    </Card>
  )
}
