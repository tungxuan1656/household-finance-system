'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
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
import {
  useRemoveHouseholdMemberMutation,
  useUpdateHouseholdMemberRoleMutation,
} from '@/features/households/hooks/use-household-mutations'
import { useHouseholdMembersQuery } from '@/features/households/hooks/use-households'
import type { HouseholdRoleDTO } from '@/features/households/types/household'
import { t } from '@/lib/i18n/t'

type HouseholdMembersCardProps = { householdId: string; isAdmin: boolean }

export const HouseholdMembersCard = ({
  householdId,
  isAdmin,
}: HouseholdMembersCardProps) => {
  const { data, isLoading, error, refetch } =
    useHouseholdMembersQuery(householdId)
  const removeMemberMutation = useRemoveHouseholdMemberMutation()
  const updateRoleMutation = useUpdateHouseholdMemberRoleMutation()
  const [memberErrorMessage, setMemberErrorMessage] = useState<string | null>(
    null,
  )

  const members = data?.items ?? []

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberMutation.mutateAsync({ householdId, userId })
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
      await updateRoleMutation.mutateAsync({ householdId, userId, role })

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
        {isLoading && members.length === 0 ? (
          <div className='flex flex-col gap-3'>
            {[1, 2].map((i) => (
              <div key={i} className='h-16 animate-pulse rounded-lg bg-muted' />
            ))}
          </div>
        ) : error && members.length === 0 ? (
          <div className='flex flex-col items-center gap-2 py-4'>
            <p className='text-sm text-muted-foreground'>
              {t('app.households.feedback.loadFailed')}
            </p>
            <Button size='sm' onClick={() => void refetch()}>
              {t('app.households.actions.retry')}
            </Button>
          </div>
        ) : members.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            {t('app.householdDetail.members.empty')}
          </p>
        ) : (
          <div className='flex flex-col gap-3'>
            {memberErrorMessage ? (
              <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3'>
                <p className='text-sm text-destructive' role='alert'>
                  {memberErrorMessage}
                </p>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => void refetch()}>
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
                  <ItemFooter className='w-full flex-wrap justify-start gap-2 sm:w-auto sm:justify-end'>
                    <NativeSelect
                      className='w-full sm:w-auto'
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
                        <Button
                          className='w-full sm:w-auto'
                          size={'sm'}
                          type='button'
                          variant='destructive'>
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
        )}
      </CardContent>
    </Card>
  )
}
