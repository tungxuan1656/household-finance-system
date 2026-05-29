'use client'

import { ActionCard } from '@/components/shared/action-card'
import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar'
import { t } from '@/lib/i18n/t'

type CreateHouseholdActionCardProps = {
  onAction: () => void
}

export const CreateHouseholdActionCard = ({
  onAction,
}: CreateHouseholdActionCardProps) => {
  return (
    <ActionCard
      actionDescription={t('app.households.empty.description')}
      actionLabel={t('app.households.actions.create')}
      actionTitle={t('app.households.create.title')}
      onAction={onAction}
    />
  )
}

type InviteMembersActionCardProps = {
  onAction: () => void
}

export const InviteMembersActionCard = ({
  onAction,
}: InviteMembersActionCardProps) => {
  return (
    <ActionCard
      actionDescription={t(
        'app.householdDetail.members.invite.card.description',
      )}
      actionIcon={
        <AvatarGroup aria-hidden='true'>
          <Avatar size='sm'>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar size='sm'>
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <Avatar size='sm'>
            <AvatarFallback>+</AvatarFallback>
          </Avatar>
        </AvatarGroup>
      }
      actionLabel={t('app.householdDetail.members.actions.invite')}
      actionTitle={t('app.householdDetail.members.invite.card.title')}
      onAction={onAction}
    />
  )
}
