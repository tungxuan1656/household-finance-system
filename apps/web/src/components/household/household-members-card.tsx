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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'
import type { HouseholdRoleDTO } from '@/types/household'

type HouseholdMembersCardProps = {
  householdId: string
  isAdmin: boolean
}

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
    if (isLoading) {
      return
    }

    if (!error) {
      setMemberErrorMessage(null)

      return
    }

    if (members.length === 0) {
      setMemberErrorMessage(error)
    }
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
          action={
            <Button
              type='button'
              variant='outline'
              onClick={() =>
                void householdActions.fetchHouseholdMembers(householdId)
              }>
              {t('app.households.actions.retry')}
            </Button>
          }
          emptyDescription={t('app.householdDetail.members.empty')}
          errorDescription={memberErrorMessage ?? undefined}
          isEmpty={!isLoading && !error && !members.length}
          isError={Boolean(memberErrorMessage && !members.length)}
          isLoading={isLoading && !members.length}
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
              <div
                key={member.userId}
                className='flex items-center justify-between gap-3 rounded-lg border p-3'>
                <div className='flex min-w-0 flex-1 items-center gap-3'>
                  <Avatar size='sm'>
                    {member.avatarUrl ? (
                      <AvatarImage alt={member.name} src={member.avatarUrl} />
                    ) : null}
                    <AvatarFallback>
                      {member.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>
                      {member.name}
                    </p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className='flex shrink-0 items-center gap-2'>
                  {isAdmin ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(role) =>
                          void householdActions.updateHouseholdMemberRole(
                            householdId,
                            member.userId,
                            role as HouseholdRoleDTO,
                          )
                        }>
                        <SelectTrigger className='w-28'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='admin'>
                            {t('app.householdDetail.members.roleOptions.admin')}
                          </SelectItem>
                          <SelectItem value='member'>
                            {t(
                              'app.householdDetail.members.roleOptions.member',
                            )}
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
                        variant='destructive'
                        onConfirm={() =>
                          void handleRemoveMember(member.userId)
                        }>
                        <Button
                          aria-label={t(
                            'app.householdDetail.members.actions.remove',
                          )}
                          size='icon'
                          type='button'
                          variant='ghost'>
                          <Trash2 />
                        </Button>
                      </ConfirmDialog>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </DataState>
      </CardContent>
    </Card>
  )
}
