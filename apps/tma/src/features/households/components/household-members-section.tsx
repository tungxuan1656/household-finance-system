import { useTranslation } from 'react-i18next'

import { QueryState } from '@/components/shared/query-state'
import { TrashIcon } from '@/components/shared/tma-icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/auth-provider'

import {
  useHouseholdMembersQuery,
  useRemoveHouseholdMemberMutation,
} from '../api'
import {
  getHouseholdAvatarFallback,
  getHouseholdRoleLabel,
} from '../presentation'

type HouseholdMembersSectionProps = {
  householdId: string
  isAdmin: boolean
}

export const HouseholdMembersSection = ({
  householdId,
  isAdmin,
}: HouseholdMembersSectionProps) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const membersQuery = useHouseholdMembersQuery(householdId)
  const removeMemberMutation = useRemoveHouseholdMemberMutation()

  const isRemoving = removeMemberMutation.isPending

  const handleRemoveMember = (memberUserId: string, memberName: string) => {
    const confirmed = window.confirm(
      t('households.detail.removeMemberConfirm', {
        name: memberName || t('groups.detail.memberFallback'),
      }),
    )
    if (!confirmed) return

    removeMemberMutation.mutate(
      { householdId, userId: memberUserId },
      {
        onSuccess: () => {},
        onError: () => {},
      },
    )
  }

  const badgeCount = membersQuery.data?.items.length ?? 0

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between space-y-0'>
        <div className='flex items-center gap-2.5'>
          <CardTitle className='text-base tracking-normal normal-case'>
            {t('households.detail.sectionMembers')}
          </CardTitle>
          <Badge
            className='rounded-full px-2 py-0.5 font-mono text-xs font-medium tracking-normal normal-case'
            variant='secondary'>
            {badgeCount}
          </Badge>
        </div>
      </CardHeader>
      <QueryState
        empty={{
          description: t('households.detail.emptyMembersDesc'),
          title: t('households.detail.emptyMembersTitle'),
        }}
        error={{
          description: t('households.detail.membersLoadErrorDesc'),
          title: t('households.detail.membersLoadError'),
        }}
        isEmpty={(data) => (data?.items?.length ?? 0) === 0}
        query={membersQuery}
        retryAction={membersQuery.refetch}
        variant='plain'>
        {(data) => (
          <CardContent className='p-0'>
            <ul className='divide-y divide-border'>
              {data.items.map((member) => (
                <li
                  key={member.userId}
                  className='flex items-center gap-3 px-4 py-3.5'>
                  <Avatar className='size-10 shrink-0 ring-1 ring-border'>
                    <AvatarImage
                      alt={member.name}
                      src={member.avatarUrl ?? undefined}
                    />
                    <AvatarFallback>
                      {getHouseholdAvatarFallback(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm leading-tight font-semibold'>
                      {member.name ||
                        user?.displayName ||
                        t('households.detail.memberFallback')}
                    </p>
                    <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
                      <Badge
                        className='rounded-full px-2 py-0 text-[11px] font-medium'
                        variant='secondary'>
                        {getHouseholdRoleLabel(member.role, t)}
                      </Badge>
                      {member.role === 'admin' ? (
                        <Badge
                          className='rounded-full border-amber-200 bg-amber-50 px-2 py-0 text-[11px] font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
                          variant='outline'>
                          {t('households.roleAdmin')}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  {isAdmin && member.userId !== user?.id ? (
                    <Button
                      aria-label={t('households.detail.removeMember')}
                      className='shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                      disabled={isRemoving}
                      size='icon-sm'
                      type='button'
                      variant='ghost'
                      onClick={() =>
                        handleRemoveMember(member.userId, member.name)
                      }>
                      <TrashIcon height={18} strokeWidth={1.8} width={18} />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </QueryState>
    </Card>
  )
}
