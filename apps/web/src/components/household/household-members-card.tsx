'use client'

import { Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { HouseholdInviteDialog } from '@/components/household/household-invite-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

  useEffect(() => {
    void householdActions.fetchHouseholdMembers(householdId)
  }, [householdId])

  const handleRemoveMember = async (userId: string) => {
    try {
      await householdActions.removeHouseholdMember(householdId, userId)
      toast.success(t('app.householdDetail.feedback.removeMemberSuccess'))
    } catch {
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
          <p className='text-sm text-muted-foreground'>
            {t('app.householdDetail.loading')}
          </p>
        )}
        {error && !members.length && (
          <p className='text-sm text-destructive'>{error}</p>
        )}
        {!isLoading && !error && (
          <div className='overflow-x-auto rounded-lg border'>
            <table className='min-w-full text-sm'>
              <thead className='border-b bg-muted/40 text-left text-muted-foreground'>
                <tr>
                  <th className='px-3 py-2 font-medium'>
                    {t('app.householdDetail.members.columns.name')}
                  </th>
                  <th className='px-3 py-2 font-medium'>
                    {t('app.householdDetail.members.columns.role')}
                  </th>
                  <th className='w-12 px-3 py-2' />
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.userId} className='border-b'>
                    <td className='px-3 py-2'>
                      <div className='flex flex-col'>
                        <span>{member.name}</span>
                        <span className='text-xs text-muted-foreground'>
                          {member.email}
                        </span>
                      </div>
                    </td>
                    <td className='px-3 py-2'>
                      <Badge variant='secondary'>{member.role}</Badge>
                    </td>
                    <td className='px-3 py-2'>
                      {isAdmin && (
                        <Button
                          size='icon'
                          type='button'
                          variant='ghost'
                          onClick={() => handleRemoveMember(member.userId)}>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {!members.length && (
                  <tr>
                    <td
                      className='px-3 py-4 text-center text-muted-foreground'
                      colSpan={3}>
                      {t('app.householdDetail.members.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
