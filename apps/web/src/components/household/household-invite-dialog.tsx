'use client'

import type { ReactElement } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { createInvitation } from '@/api/invitation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { t } from '@/lib/i18n/t'
import type { InvitationRoleDTO, InvitationTtlHours } from '@/types/invitation'

type HouseholdInviteDialogProps = {
  householdId: string
  isOpen?: boolean
  trigger?: ReactElement | null
  onOpenChange?: (open: boolean) => void
}

export const HouseholdInviteDialog = ({
  householdId,
  isOpen,
  trigger,
  onOpenChange,
}: HouseholdInviteDialogProps) => {
  const [invitationRole, setInvitationRole] =
    useState<InvitationRoleDTO>('member')
  const [invitationTtlHours, setInvitationTtlHours] =
    useState<InvitationTtlHours>(72)
  const [inviteLink, setInviteLink] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)

  const handleGenerateInviteLink = async () => {
    try {
      setIsCreatingInvite(true)

      const createdInvitation = await createInvitation(householdId, {
        role: invitationRole,
        ttlHours: invitationTtlHours,
      })
      const origin = window.location.origin
      setInviteLink(`${origin}${createdInvitation.invitePath}`)

      toast.success(
        t('app.householdDetail.members.invite.feedback.createSuccess'),
      )
    } catch {
      toast.error(t('app.householdDetail.members.invite.feedback.createFailed'))
    } finally {
      setIsCreatingInvite(false)
    }
  }

  const handleCopyInviteLink = async () => {
    if (!inviteLink) {
      return
    }

    try {
      await navigator.clipboard.writeText(inviteLink)

      toast.success(
        t('app.householdDetail.members.invite.feedback.copySuccess'),
      )
    } catch {
      toast.error(t('app.householdDetail.members.invite.feedback.copyFailed'))
    }
  }

  return (
    <Dialog
      open={isOpen ?? isDialogOpen}
      onOpenChange={(open) => {
        onOpenChange?.(open)
        if (isOpen === undefined) {
          setIsDialogOpen(open)
        }
        if (!open) {
          setInviteLink('')
        }
      }}>
      {trigger === null ? null : (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button type='button' variant='outline'>
              {t('app.householdDetail.members.actions.invite')}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('app.householdDetail.members.invite.title')}
          </DialogTitle>
          <DialogDescription>
            {t('app.householdDetail.members.invite.description')}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className='flex flex-row'>
          <Field>
            <FieldLabel htmlFor='invite-role'>
              {t('app.householdDetail.members.invite.fields.role.label')}
            </FieldLabel>
            <NativeSelect
              id='invite-role'
              labelClassName='text-sm'
              size='sm'
              value={invitationRole}
              onChange={(event) => {
                const nextRole = event.target.value
                if (nextRole === 'admin' || nextRole === 'member') {
                  setInvitationRole(nextRole)
                }
              }}>
              <NativeSelectOption value='member'>
                {t(
                  'app.householdDetail.members.invite.fields.role.options.member',
                )}
              </NativeSelectOption>
              <NativeSelectOption value='admin'>
                {t(
                  'app.householdDetail.members.invite.fields.role.options.admin',
                )}
              </NativeSelectOption>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor='invite-ttl'>
              {t('app.householdDetail.members.invite.fields.ttl.label')}
            </FieldLabel>
            <NativeSelect
              id='invite-ttl'
              labelClassName='text-sm'
              size='sm'
              value={String(invitationTtlHours)}
              onChange={(event) => {
                const nextTtlHours = Number(event.target.value)
                if (
                  nextTtlHours === 24 ||
                  nextTtlHours === 72 ||
                  nextTtlHours === 168
                ) {
                  setInvitationTtlHours(nextTtlHours)
                }
              }}>
              <NativeSelectOption value='24'>
                {t('app.householdDetail.members.invite.fields.ttl.options.24h')}
              </NativeSelectOption>
              <NativeSelectOption value='72'>
                {t('app.householdDetail.members.invite.fields.ttl.options.72h')}
              </NativeSelectOption>
              <NativeSelectOption value='168'>
                {t('app.householdDetail.members.invite.fields.ttl.options.7d')}
              </NativeSelectOption>
            </NativeSelect>
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor='invite-link'>
              {t('app.householdDetail.members.invite.fields.link.label')}
            </FieldLabel>
            <Input
              readOnly
              className='h-10 bg-muted text-sm text-muted-foreground'
              id='invite-link'
              placeholder={t(
                'app.householdDetail.members.invite.fields.link.placeholder',
              )}
              value={inviteLink}
            />
          </Field>
        </FieldGroup>

        <DialogFooter className='flex-col sm:flex-row'>
          <Button
            disabled={!inviteLink}
            size={'sm'}
            type='button'
            variant='outline'
            onClick={() => void handleCopyInviteLink()}>
            {t('app.householdDetail.members.invite.actions.copy')}
          </Button>
          <Button
            disabled={isCreatingInvite}
            size={'sm'}
            type='button'
            onClick={() => void handleGenerateInviteLink()}>
            {isCreatingInvite
              ? t('app.householdDetail.members.invite.actions.generating')
              : t('app.householdDetail.members.invite.actions.generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
