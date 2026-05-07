'use client'

import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { HouseholdInviteDialog } from '@/components/household/household-invite-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

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
  const [failedRemovalUserId, setFailedRemovalUserId] = useState<string | null>(
    null,
  )
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
      setFailedRemovalUserId(null)

      return
    }

    if (members.length === 0) {
      setMemberErrorMessage(error)
    }
  }, [error, isLoading, members.length])

  const handleRemoveMember = async (userId: string) => {
    try {
      await householdActions.removeHouseholdMember(householdId, userId)
      setFailedRemovalUserId(null)
      setMemberErrorMessage(null)
      toast.success(t('app.householdDetail.feedback.removeMemberSuccess'))
    } catch {
      setFailedRemovalUserId(userId)

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
          {isAdmin && <HouseholdInviteDialog householdId={householdId} />}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !members.length && (
          <div className='flex flex-col gap-3'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className='flex items-center justify-between gap-3 rounded-lg border p-3'>
                <div className='flex flex-1 flex-col gap-2'>
                  <Skeleton className='h-4 w-28' />
                  <Skeleton className='h-3 w-40' />
                </div>
                <Skeleton className='h-8 w-20 rounded-full' />
              </div>
            ))}
          </div>
        )}
        {memberErrorMessage && !members.length && (
          <div className='flex flex-wrap items-center justify-between gap-2'>
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
        )}
        {members.length > 0 ? (
          <div className='flex flex-col gap-3'>
            {memberErrorMessage ? (
              <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3'>
                <p className='text-sm text-destructive' role='alert'>
                  {memberErrorMessage}
                </p>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    if (failedRemovalUserId) {
                      void handleRemoveMember(failedRemovalUserId)

                      return
                    }

                    void householdActions.fetchHouseholdMembers(householdId)
                  }}>
                  {t('app.households.actions.retry')}
                </Button>
              </div>
            ) : null}
            {members.map((member) => (
              <div
                key={member.userId}
                className='flex items-start justify-between gap-3 rounded-lg border p-3'>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{member.name}</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {member.email}
                  </p>
                </div>
                <div className='flex shrink-0 items-center gap-2'>
                  <Badge variant='secondary'>{member.role}</Badge>
                  {isAdmin ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          aria-label={t(
                            'app.householdDetail.members.actions.remove',
                          )}
                          size='icon'
                          type='button'
                          variant='ghost'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t(
                              'app.householdDetail.members.removeDialog.title',
                            )}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t(
                              'app.householdDetail.members.removeDialog.description',
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className='flex-col sm:flex-row'>
                          <AlertDialogCancel>
                            {t('common.actions.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            variant='destructive'
                            onClick={() =>
                              void handleRemoveMember(member.userId)
                            }>
                            {t(
                              'app.householdDetail.members.removeDialog.confirm',
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {!isLoading && !error && !members.length ? (
          <div className='rounded-lg border px-3 py-4 text-center text-sm text-muted-foreground'>
            {t('app.householdDetail.members.empty')}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
