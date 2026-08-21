import { QueryState } from '@/components/shared/query-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RecentExpenses } from '@/features/expenses/components/expense-timeline'
import { TMA_PATHS } from '@/lib/constants/routes'

import { GroupHeroCard } from '../components/group-detail-hero-card'
import { GroupMemberList } from '../components/group-detail-member-list'
import { GroupOverviewCard } from '../components/group-detail-overview-card'
import { useGroupDetail } from '../hooks/use-group-detail'

export const GroupDetailPage = () => {
  const { id, t, groupQuery, summaryQuery, householdNameById, feedback } =
    useGroupDetail()

  if (!id) {
    return (
      <TmaPageShell
        contentClassName='flex flex-col gap-4'
        title={t('groups.detail.title')}>
        <Card size='sm'>
          <CardHeader>
            <CardTitle className='text-base font-bold normal-case'>
              {t('groups.detail.invalidIdTitle')}
            </CardTitle>
            <CardDescription>
              {t('groups.detail.invalidIdDesc')}
            </CardDescription>
          </CardHeader>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell
      contentClassName='flex flex-col gap-4'
      title={t('groups.detail.title')}>
      {feedback ? (
        <Card size='sm'>
          <CardHeader className='gap-1.5'>
            <CardDescription
              className={
                feedback.tone === 'error'
                  ? 'text-destructive'
                  : 'text-emerald-600'
              }>
              {feedback.message}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <QueryState
        empty={{
          title: t('groups.detail.notFoundTitle'),
          description: t('groups.detail.notFoundDesc'),
        }}
        error={{
          title: t('groups.detail.loadError'),
          description: t('groups.detail.loadErrorDesc'),
        }}
        isEmpty={(data) => !data}
        pending={{
          title: t('groups.detail.loading'),
          description: t('groups.detail.loadingDesc'),
        }}
        query={groupQuery}>
        {(group) => {
          const contextLabel = group.householdId
            ? (householdNameById.get(group.householdId) ??
              t('groups.contextHousehold'))
            : t('groups.contextPersonal')

          return (
            <>
              <GroupHeroCard contextLabel={contextLabel} group={group} />

              <QueryState
                error={{
                  title: t('groups.detail.overviewErrorTitle'),
                  description: t('groups.detail.overviewErrorDesc'),
                }}
                pending={{
                  title: t('groups.detail.overviewLoadingTitle'),
                  description: t('groups.detail.overviewLoadingDesc'),
                }}
                query={summaryQuery}
                variant='card'>
                {(summary) => (
                  <>
                    <section className='flex flex-col gap-3'>
                      <h2 className='text-sm font-bold tracking-tight'>
                        {t('groups.detail.sectionOverview')}
                      </h2>
                      <GroupOverviewCard group={group} summary={summary} />
                    </section>

                    {summary.memberContributions.length ? (
                      <section className='flex flex-col gap-3'>
                        <h2 className='text-sm font-bold tracking-tight'>
                          {t('groups.detail.sectionMembers')}
                        </h2>
                        <GroupMemberList
                          members={summary.memberContributions}
                        />
                      </section>
                    ) : null}
                  </>
                )}
              </QueryState>

              <RecentExpenses
                groupId={group.id}
                householdId={group.householdId ?? undefined}
                showHouseholdLabel={group.householdId == null}
                title={t('groups.detail.sectionExpenses')}
                viewAllHref={TMA_PATHS.expenses}
                viewAllState={{ appliedGroupId: group.id }}
              />
            </>
          )
        }}
      </QueryState>
    </TmaPageShell>
  )
}
