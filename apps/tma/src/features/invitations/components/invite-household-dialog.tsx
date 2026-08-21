import { shareURL } from '@tma.js/sdk'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useCreateInvitationMutation } from '@/features/invitations/api'
import type {
  InvitationRoleDTO,
  InvitationTtlHours,
} from '@/features/invitations/types'
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

  const roleOptions = [
    { label: t('invitations.roleMember'), value: 'member' as const },
    { label: t('invitations.roleAdmin'), value: 'admin' as const },
  ]

  const ttlOptions = [
    { label: t('invitations.ttl24h'), value: '24' as const },
    { label: t('invitations.ttl72h'), value: '72' as const },
    { label: t('invitations.ttl7d'), value: '168' as const },
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
    <Card>
      <CardHeader>
        <CardTitle>{t('invitations.inviteTitle')}</CardTitle>
        <CardDescription>
          {t('invitations.inviteDesc', { householdName })}
        </CardDescription>
      </CardHeader>

      <CardContent className='grid gap-3'>
        {!inviteLink ? (
          <>
            <FieldGroup>
              <Field>
                <FieldLabel id='invitation-role-label'>
                  {t('invitations.roleLabel')}
                </FieldLabel>
                <ToggleGroup
                  aria-labelledby='invitation-role-label'
                  className='flex flex-wrap gap-2'
                  id='invitation-role-picker'
                  value={[role]}
                  onValueChange={(values) => {
                    const v = values[0]
                    if (v && isInvitationRole(v)) setRole(v)
                  }}>
                  {roleOptions.map((option) => (
                    <ToggleGroupItem key={option.value} value={option.value}>
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                {role === 'admin' ? (
                  <p className='mt-1 text-xs font-semibold text-amber-700'>
                    {t('invitations.adminRoleWarning')}
                  </p>
                ) : null}
              </Field>

              <Field>
                <FieldLabel id='invitation-ttl-label'>
                  {t('invitations.ttlLabel')}
                </FieldLabel>
                <ToggleGroup
                  aria-labelledby='invitation-ttl-label'
                  className='flex flex-wrap gap-2'
                  id='invitation-ttl-picker'
                  value={[String(ttlHours)]}
                  onValueChange={(values) => {
                    const v = values[0]
                    if (v) setTtlHours(parseInvitationTtlHours(v))
                  }}>
                  {ttlOptions.map((option) => (
                    <ToggleGroupItem key={option.value} value={option.value}>
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            </FieldGroup>

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
            <div className='grid gap-2'>
              <p className='m-0 text-sm text-foreground'>
                {t('invitations.linkReady')}
              </p>

              <CardDescription className='font-mono text-xs break-all'>
                {inviteLink}
              </CardDescription>
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
