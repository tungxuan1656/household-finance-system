import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'

import { DataState } from '@/components/shared/data-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RecentExpenses } from '@/features/expenses/components/expense-timeline'
import { useHouseholdsQuery } from '@/features/home/api'
import { formatCurrencyMinor } from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'

import { useExpenseGroupDetailQuery, useGroupSummaryQuery } from '../api'
import {
  formatOptionalGroupMoney,
  getGroupBudgetLabel,
  getGroupDateRangeLabel,
  getGroupProgress,
  getGroupStatusLabel,
} from '../presentation'

type GroupPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

const GroupGlyph = () => (
  <svg
    fill='none'
    height='20'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    viewBox='0 0 24 24'
    width='20'>
    <circle cx='9' cy='9' r='2.5' />
    <circle cx='16.5' cy='10' r='2' />
    <path d='M5.5 17c.8-2 2.3-3 4.5-3s3.7 1 4.5 3' />
    <path d='M14.5 17c.4-1.3 1.4-2.1 3-2.4' />
  </svg>
)

export const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { t } = useTranslation()
  const groupQuery = useExpenseGroupDetailQuery(id)
  const summaryQuery = useGroupSummaryQuery(id)
  const householdsQuery = useHouseholdsQuery()
  const [feedback] = useState<GroupPageFeedback | null>(
    () =>
      (location.state as { feedback?: GroupPageFeedback } | null)?.feedback ??
      null,
  )

  const group = groupQuery.data
  const summary = summaryQuery.data
  const householdNameById = useMemo(
    () =>
      new Map(
        (householdsQuery.data?.items ?? []).map((household) => [
          household.id,
          household.name,
        ]),
      ),
    [householdsQuery.data?.items],
  )
  const contextLabel = group?.householdId
    ? (householdNameById.get(group.householdId) ?? t('groups.contextHousehold'))
    : t('groups.contextPersonal')
  const totalSpendMinor =
    summary?.totalSpendMinor ?? group?.totalSpendMinor ?? null
  const progress = group
    ? getGroupProgress(totalSpendMinor ?? 0, group.eventBudgetMinor)
    : null
  const isGroupMissing = !groupQuery.isLoading && !groupQuery.isError && !group

  if (!id) {
    return (
      <TmaPageShell title={t('groups.detail.title')}>
        <Card>
          <CardHeader>
            <CardTitle>{t('groups.detail.invalidIdTitle')}</CardTitle>
            <CardDescription>
              {t('groups.detail.invalidIdDesc')}
            </CardDescription>
          </CardHeader>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title={t('groups.detail.title')}>
      {feedback ? (
        <Card>
          <CardHeader>
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

      <DataState
        emptyDescription={t('groups.detail.notFoundDesc')}
        emptyTitle={t('groups.detail.notFoundTitle')}
        errorDescription={t('groups.detail.loadErrorDesc')}
        errorTitle={t('groups.detail.loadError')}
        isEmpty={isGroupMissing}
        isError={groupQuery.isError && !group}
        isLoading={groupQuery.isLoading && !group}
        loadingDescription={t('groups.detail.loadingDesc')}
        loadingTitle={t('groups.detail.loading')}
        retryAction={groupQuery.refetch}>
        {group ? (
          <>
            <Card>
              <CardHeader>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <CardDescription>{contextLabel}</CardDescription>
                    <CardTitle className='text-2xl leading-tight font-extrabold'>
                      {group.name}
                    </CardTitle>
                    {group.description ? (
                      <CardDescription className='mt-2'>
                        {group.description}
                      </CardDescription>
                    ) : null}
                  </div>
                  <div className='flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                    <GroupGlyph />
                  </div>
                </div>
              </CardHeader>
              <CardContent className='flex flex-wrap gap-2'>
                <Badge variant='secondary'>
                  {getGroupStatusLabel(group.status, t)}
                </Badge>
                <Badge variant='outline'>
                  {getGroupDateRangeLabel(group, t)}
                </Badge>
              </CardContent>
            </Card>

            <section className='grid gap-3'>
              <h2 className='m-0 text-base font-bold'>
                {t('groups.detail.sectionOverview')}
              </h2>
              <DataState
                errorDescription={t('groups.detail.overviewErrorDesc')}
                errorTitle={t('groups.detail.overviewErrorTitle')}
                isError={summaryQuery.isError && !summary}
                isLoading={summaryQuery.isLoading && !summary}
                loadingDescription={t('groups.detail.overviewLoadingDesc')}
                loadingTitle={t('groups.detail.overviewLoadingTitle')}
                retryAction={summaryQuery.refetch}>
                <Card>
                  <CardContent className='grid gap-4'>
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='grid gap-1'>
                        <CardDescription>
                          {t('groups.detail.statTotalSpent')}
                        </CardDescription>
                        <span className='text-base font-extrabold text-foreground'>
                          {totalSpendMinor != null
                            ? formatCurrencyMinor(totalSpendMinor, 'VND')
                            : '-'}
                        </span>
                      </div>
                      <div className='grid gap-1'>
                        <CardDescription>
                          {t('groups.detail.statExpenseCount')}
                        </CardDescription>
                        <p className='text-base font-semibold text-foreground'>
                          {summary?.expenseCount ?? 0}
                        </p>
                      </div>
                      <div className='grid gap-1'>
                        <CardDescription>
                          {t('groups.detail.statBudget')}
                        </CardDescription>
                        <p className='text-sm font-semibold text-foreground'>
                          {getGroupBudgetLabel(group, t)}
                        </p>
                      </div>
                      <div className='grid gap-1'>
                        <CardDescription>
                          {t('groups.detail.statRemaining')}
                        </CardDescription>
                        <span
                          className={
                            summary?.budgetRemainingMinor != null &&
                            summary.budgetRemainingMinor < 0
                              ? 'text-sm font-bold text-destructive'
                              : 'text-sm font-bold text-foreground'
                          }>
                          {formatOptionalGroupMoney(
                            summary?.budgetRemainingMinor ?? null,
                          )}
                        </span>
                      </div>
                    </div>

                    {progress ? (
                      <div className='grid gap-1'>
                        <div className='flex items-center justify-between text-sm text-muted-foreground'>
                          <span>{t('groups.detail.statProgress')}</span>
                          <span>{progress.percentUsed}%</span>
                        </div>
                        <div className='h-2 overflow-hidden rounded-full bg-black/6'>
                          <div
                            className={
                              progress.isOverBudget
                                ? 'h-full rounded-full bg-destructive'
                                : 'h-full rounded-full bg-primary'
                            }
                            style={{ width: `${progress.widthPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </DataState>
            </section>

            {summary?.memberContributions.length ? (
              <section className='grid gap-3'>
                <h2 className='m-0 text-base font-bold'>
                  {t('groups.detail.sectionMembers')}
                </h2>
                <Card>
                  <CardContent className='grid gap-2'>
                    {summary.memberContributions.map((member) => (
                      <article
                        key={member.userId}
                        className='flex items-center justify-between gap-3'>
                        <div className='min-w-0'>
                          <h3 className='m-0 truncate text-sm font-bold text-foreground'>
                            {member.displayName ??
                              t('groups.detail.memberFallback')}
                          </h3>
                          <CardDescription>
                            {t('statistics.expenseCount', {
                              count: member.expenseCount,
                            })}
                          </CardDescription>
                        </div>
                        <span className='shrink-0 text-sm font-bold text-foreground'>
                          {formatCurrencyMinor(member.totalSpendMinor, 'VND')}
                        </span>
                      </article>
                    ))}
                  </CardContent>
                </Card>
              </section>
            ) : null}

            <RecentExpenses
              groupId={group.id}
              householdId={group.householdId ?? undefined}
              showHouseholdLabel={group.householdId == null}
              title={t('groups.detail.sectionExpenses')}
              viewAllHref={TMA_PATHS.expenses}
              viewAllState={{ appliedGroupId: group.id }}
            />
          </>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
