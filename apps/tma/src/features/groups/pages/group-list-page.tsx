import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  buttonVariants,
  Card,
  CardDescription,
  CardTitle,
  Chip,
  DataState,
  Eyebrow,
  IconBadge,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
import { useHouseholdsQuery } from '@/features/home/api'
import { formatCurrencyMinor } from '@/features/home/presentation'
import type { HouseholdDTO } from '@/features/home/types'
import { getGroupDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '../api'
import {
  getGroupBudgetLabel,
  getGroupContextLabel,
  getGroupDateRangeLabel,
  getGroupProgress,
  getGroupStatusLabel,
} from '../presentation'
import type { ExpenseGroupDTO, GroupListItem } from '../types'

const groupAccent = { background: '#fff3e8', foreground: '#ff8a3d' }

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

const buildGroupListItems = (
  personalGroups: ExpenseGroupDTO[],
  householdGroupsByHousehold: Array<{
    groups: ExpenseGroupDTO[]
    household: HouseholdDTO
  }>,
): GroupListItem[] => [
  ...personalGroups.map((group) => ({ group, household: null })),
  ...householdGroupsByHousehold.flatMap(({ groups, household }) =>
    groups.map((group) => ({ group, household })),
  ),
]

const GroupListCard = ({ item }: { item: GroupListItem }) => {
  const progress = getGroupProgress(
    item.group.totalSpendMinor,
    item.group.eventBudgetMinor,
  )

  return (
    <Link
      className='grid gap-3 rounded-3xl bg-white p-4 shadow-tma-card transition active:scale-[0.99]'
      to={getGroupDetailPath(item.group.id)}
      onClick={() => impact('light')}>
      <div className='flex items-start justify-between gap-3'>
        <IconBadge accent={groupAccent}>
          <GroupGlyph />
        </IconBadge>
        <Chip tone={item.group.status === 'active' ? 'success' : 'warning'}>
          {getGroupStatusLabel(item.group.status)}
        </Chip>
      </div>

      <div className='min-w-0'>
        <CardTitle className='truncate'>{item.group.name}</CardTitle>
        <CardDescription className='mt-1 line-clamp-2'>
          {item.group.description || getGroupContextLabel(item)}
        </CardDescription>
      </div>

      <div className='grid grid-cols-2 gap-2.5'>
        <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
          <Eyebrow>Đã chi</Eyebrow>
          <MoneyLabel className='text-sm font-bold'>
            {formatCurrencyMinor(item.group.totalSpendMinor, 'VND')}
          </MoneyLabel>
        </div>
        <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
          <Eyebrow>Ngân sách</Eyebrow>
          <strong className='text-sm text-tma-text-strong'>
            {getGroupBudgetLabel(item.group)}
          </strong>
        </div>
      </div>

      {progress ? (
        <div className='grid gap-1.5'>
          <div className='h-2 overflow-hidden rounded-full bg-black/[0.06]'>
            <div
              className={
                progress.isOverBudget
                  ? 'h-full rounded-full bg-[#d93838]'
                  : 'h-full rounded-full bg-tma-primary'
              }
              style={{ width: `${progress.widthPercent}%` }}
            />
          </div>
          <CardDescription>
            {progress.percentUsed}% ngân sách đã dùng
          </CardDescription>
        </div>
      ) : null}

      <div className='flex items-center justify-between gap-3 text-sm text-tma-text-muted'>
        <span className='truncate'>{getGroupContextLabel(item)}</span>
        <span className='shrink-0'>{getGroupDateRangeLabel(item.group)}</span>
      </div>
    </Link>
  )
}

export const GroupListPage = () => {
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
  const householdGroupQueries = useHouseholdExpenseGroupQueries(households)

  const groupItems = useMemo(
    () =>
      buildGroupListItems(
        personalGroupsQuery.data?.items ?? [],
        households.map((household, index) => ({
          household,
          groups: householdGroupQueries[index]?.data?.items ?? [],
        })),
      ).sort((left, right) => right.group.createdAt - left.group.createdAt),
    [householdGroupQueries, households, personalGroupsQuery.data?.items],
  )

  const isInitialLoading =
    groupItems.length === 0 &&
    (householdsQuery.isLoading ||
      personalGroupsQuery.isLoading ||
      householdGroupQueries.some((query) => query.isLoading))
  const isInitialError =
    groupItems.length === 0 &&
    (householdsQuery.isError ||
      personalGroupsQuery.isError ||
      householdGroupQueries.some((query) => query.isError))

  return (
    <TmaPageShell title='Nhóm'>
      <Card className='grid gap-3 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <strong className='mt-1 block text-[30px] leading-none font-extrabold text-tma-text-strong'>
              {groupItems.length}
            </strong>
          </div>
          <IconBadge accent={groupAccent}>
            <GroupGlyph />
          </IconBadge>
        </div>
      </Card>

      <Section>
        <SectionHeader
          action={
            groupItems.length > 0 ? (
              <Link
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
                to={TMA_PATHS.groupsNew}
                onClick={() => impact('light')}>
                Tạo mới
              </Link>
            ) : null
          }
          title='Group của bạn'
        />

        <DataState
          customAction={
            groupItems.length === 0 && !isInitialLoading ? (
              <Link
                className={buttonVariants({ variant: 'secondary' })}
                to={TMA_PATHS.groupsNew}
                onClick={() => impact('light')}>
                Tạo group
              </Link>
            ) : null
          }
          emptyDescription='Tạo group đầu tiên để gom chi tiêu theo chuyến đi, sự kiện hoặc mục tiêu riêng.'
          emptyTitle='Chưa có group nào'
          errorDescription='API group hoặc household đang lỗi. Thử mở lại trang sau khi phiên đăng nhập ổn định.'
          errorTitle='Không tải được group'
          isEmpty={
            !isInitialLoading && !isInitialError && groupItems.length === 0
          }
          isError={isInitialError}
          isLoading={isInitialLoading}
          loadingDescription='Danh sách group cá nhân và household sẽ hiện sau khi các truy vấn hoàn tất.'
          loadingTitle='Đang tải group'
          retryAction={async () => {
            await Promise.all([
              householdsQuery.refetch(),
              personalGroupsQuery.refetch(),
              ...householdGroupQueries.map((query) => query.refetch()),
            ])
          }}>
          <div className='grid gap-3'>
            {groupItems.map((item) => (
              <GroupListCard key={item.group.id} item={item} />
            ))}
          </div>
        </DataState>
      </Section>
    </TmaPageShell>
  )
}
