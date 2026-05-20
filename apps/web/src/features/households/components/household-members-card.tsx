'use client'

import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataState } from '@/components/shared/data-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { HouseholdRoleDTO } from '@/features/households/types/household'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

type HouseholdMembersCardProps = { householdId: string; isAdmin: boolean }

export const HouseholdMembersCard = ({
  householdId,
  isAdmin,
}: HouseholdMembersCardProps) => {
  const members = useHouseholdStore.use.members()
  const isLoading = useHouseholdStore.use.isLoading()
  const error = useHouseholdStore.use.error()
  const [memberErrorMessage, setMemberErrorMessage] = useState<string | null>(
    null,
  )

  useEffect(() => {
    void householdActions.fetchHouseholdMembers(householdId)
  }, [householdId])

  useEffect(() => {
    if (isLoading) return
    if (!error) {
      setMemberErrorMessage(null)

      return
    }
    if (members.length === 0) setMemberErrorMessage(error)
  }, [error, isLoading, members.length])

  const handleRemoveMember = async (userId: string) => {
    try {
      await householdActions.removeHouseholdMember(householdId, userId)
      setMemberErrorMessage(null)
      toast.success(t('app.householdDetail.feedback.removeMemberSuccess'))
    } catch {
      setMemberErrorMessage(
        t('app.householdDetail.feedback.removeMemberFailed'),
      )

      toast.error(t('app.householdDetail.feedback.removeMemberFailed'))
    }
  }
  const handleMemberRoleChange = async (
    userId: string,
    role: HouseholdRoleDTO,
  ) => {
    try {
      await householdActions.updateHouseholdMemberRole(
        householdId,
        userId,
        role,
      )

      setMemberErrorMessage(null)
    } catch {
      setMemberErrorMessage(t('app.householdDetail.feedback.updateFailed'))
      toast.error(t('app.householdDetail.feedback.updateFailed'))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex flex-col gap-1'>
            <CardTitle>{t('app.householdDetail.members.title')}</CardTitle>
            <CardDescription>
              {t('app.householdDetail.members.description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <DataState
          emptyDescription={t('app.householdDetail.members.empty')}
          errorDescription={memberErrorMessage ?? undefined}
          isEmpty={!isLoading && !error && !members.length}
          isError={Boolean(memberErrorMessage && !members.length)}
          isLoading={isLoading && !members.length}
          retryAction={() =>
            householdActions.fetchHouseholdMembers(householdId)
          }
          title={t('app.householdDetail.members.title')}>
          <div className='flex flex-col gap-3'>
            {memberErrorMessage ? (
              <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3'>
                <p className='text-sm text-destructive' role='alert'>
                  {memberErrorMessage}
                </p>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    void householdActions.fetchHouseholdMembers(householdId)
                  }>
                  {t('app.households.actions.retry')}
                </Button>
              </div>
            ) : null}
            {members.map((member) => (
              <Item key={member.userId} variant='outline'>
                <ItemMedia variant='image'>
                  <Avatar>
                    {member.avatarUrl ? (
                      <AvatarImage alt={member.name} src={member.avatarUrl} />
                    ) : null}
                    <AvatarFallback>
                      {member.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className='truncate'>{member.name}</ItemTitle>
                  <ItemDescription className='truncate text-xs'>
                    {member.email}
                  </ItemDescription>
                </ItemContent>
                {isAdmin ? (
                  <ItemFooter className='justify-end'>
                    <NativeSelect
                      labelClassName='text-sm'
                      size='sm'
                      value={member.role}
                      onChange={(event) =>
                        void handleMemberRoleChange(
                          member.userId,
                          event.target.value as HouseholdRoleDTO,
                        )
                      }>
                      <NativeSelectOption value='member'>
                        {t('app.householdDetail.members.roleOptions.member')}
                      </NativeSelectOption>
                      <NativeSelectOption value='admin'>
                        {t('app.householdDetail.members.roleOptions.admin')}
                      </NativeSelectOption>
                    </NativeSelect>
                    <ConfirmDialog
                      confirmLabel={t(
                        'app.householdDetail.members.removeDialog.confirm',
                      )}
                      description={t(
                        'app.householdDetail.members.removeDialog.description',
                      )}
                      title={t(
                        'app.householdDetail.members.removeDialog.title',
                      )}
                      trigger={
                        <Button size={'sm'} type='button' variant='destructive'>
                          <Trash2 className='size-3.5' />
                          {t('app.householdDetail.actions.delete')}
                        </Button>
                      }
                      variant='destructive'
                      onConfirm={() => void handleRemoveMember(member.userId)}
                    />
                  </ItemFooter>
                ) : null}
              </Item>
            ))}
          </div>
        </DataState>
      </CardContent>
    </Card>
  )
}
