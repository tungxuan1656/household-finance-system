import { useTranslation } from 'react-i18next'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrencyMinor } from '@/features/home/presentation'

import type { MemberContributionDTO } from '../types'

type GroupMemberListProps = {
  members: MemberContributionDTO[]
}

export const GroupMemberList = ({ members }: GroupMemberListProps) => {
  const { t } = useTranslation()

  return (
    <Card size='sm'>
      <CardContent className='p-0'>
        <div className='divide-y divide-border'>
          {members.map((member) => (
            <article
              key={member.userId}
              className='flex items-center justify-between gap-3 px-(--card-spacing) py-2.5'>
              <div className='min-w-0'>
                <h3 className='m-0 truncate text-sm font-bold tracking-tight text-foreground'>
                  {member.displayName ?? t('groups.detail.memberFallback')}
                </h3>
                <p className='m-0 text-xs text-muted-foreground'>
                  {t('statistics.expenseCount', {
                    count: member.expenseCount,
                  })}
                </p>
              </div>
              <span className='shrink-0 text-sm font-bold text-foreground tabular-nums'>
                {formatCurrencyMinor(member.totalSpendMinor, 'VND')}
              </span>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
