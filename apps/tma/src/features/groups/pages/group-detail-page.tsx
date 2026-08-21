import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
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
import type {
  ExpenseGroupDTO,
  GroupSummaryDTO,
  MemberContributionDTO,
} from '../types'

type GroupPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

// ── glyph (compact, reuse across list/detail) ────────────────────────
const GroupGlyph = () => (
  <svg
    aria-hidden
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

// ── dumb: hero ───────────────────────────────────────────────────────
const GroupHeroCard = ({
  group,
  contextLabel,
}: {
  group: ExpenseGroupDTO
  contextLabel: string
}) => {
  const { t } = useTranslation()

  return (
    <Card size='sm'>
      <CardHeader className='gap-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='grid min-w-0 gap-1'>
            <CardDescription className='truncate text-xs'>
              {contextLabel}
            </CardDescription>
            <CardTitle className='text-xl leading-tight font-extrabold tracking-tight normal-case'>
              {group.name}
            </CardTitle>
            {group.description ? (
              <CardDescription className='mt-1 line-clamp-2 text-sm'>
                {group.description}
              </CardDescription>
            ) : null}
          </div>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
            <GroupGlyph />
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex flex-wrap gap-2'>
        <Badge variant='secondary'>
          {getGroupStatusLabel(group.status, t)}
        </Badge>
        <Badge variant='outline'>{getGroupDateRangeLabel(group, t)}</Badge>
      </CardContent>
    </Card>
  )
}

// ── dumb: overview 2x2 + progress ────────────────────────────────────
const GroupOverviewCard = ({
  group,
  summary,
}: {
  group: ExpenseGroupDTO
  summary: GroupSummaryDTO
}) => {
  const { t } = useTranslation()
  const totalSpendMinor = summary.totalSpendMinor ?? group.totalSpendMinor ?? 0
  const progress = getGroupProgress(totalSpendMinor, group.eventBudgetMinor)

  return (
    <Card size='sm'>
      <CardContent className='grid gap-4'>
        <div className='grid grid-cols-2 gap-3'>
          <div className='grid gap-1'>
            <span className='text-xs text-muted-foreground'>
              {t('groups.detail.statTotalSpent')}
            </span>
            <span className='text-sm font-bold text-foreground tabular-nums'>
              {formatCurrencyMinor(totalSpendMinor, 'VND')}
            </span>
          </div>
          <div className='grid gap-1'>
            <span className='text-xs text-muted-foreground'>
              {t('groups.detail.statExpenseCount')}
            </span>
            <span className='text-sm font-bold text-foreground tabular-nums'>
              {summary.expenseCount}
            </span>
          </div>
          <div className='grid gap-1'>
            <span className='text-xs text-muted-foreground'>
              {t('groups.detail.statBudget')}
            </span>
            <span className='text-sm font-bold text-foreground tabular-nums'>
              {getGroupBudgetLabel(group, t)}
            </span>
          </div>
          <div className='grid gap-1'>
            <span className='text-xs text-muted-foreground'>
              {t('groups.detail.statRemaining')}
            </span>
            <span
              className={
                summary.budgetRemainingMinor != null &&
                summary.budgetRemainingMinor < 0
                  ? 'text-sm font-bold text-destructive tabular-nums'
                  : 'text-sm font-bold text-foreground tabular-nums'
              }>
              {formatOptionalGroupMoney(summary.budgetRemainingMinor ?? null)}
            </span>
          </div>
        </div>

        {progress ? (
          <div className='grid gap-1.5'>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>{t('groups.detail.statProgress')}</span>
              <span className='tabular-nums'>{progress.percentUsed}%</span>
            </div>
            <div className='h-2 overflow-hidden rounded-full bg-muted'>
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
  )
}

// ── dumb: member list with dividers ──────────────────────────────────
const GroupMemberList = ({ members }: { members: MemberContributionDTO[] }) => {
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

// ── page (smart: orchestrate queries + layout) ───────────────────────
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
