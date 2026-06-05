import { useQueries, useQuery } from '@tanstack/react-query'
import type { ReactElement, ReactNode, SVGProps } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  TmaInlineAction,
  TmaMonogramBadge,
} from '@/components/shared/tma-page-shell'
import {
  Avatar,
  type ButtonVariant,
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
import { buildHouseholdNameMap } from '@/features/expenses/presentation'
import {
  analyticsOverviewQueryOptions,
  budgetListQueryOptions,
  householdMembersQueryOptions,
  useAnalyticsComparisonQuery,
  useAnalyticsOverviewQuery,
  useExpenseListQuery,
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getBudgetProgress,
  getCategoryPresentation,
  getComparisonLabel,
  getExpenseGroupLabel,
  getExpenseSecondaryText,
  getHouseholdBudgetLabel,
  resolveInitials,
} from '@/features/home/presentation'
import type {
  AnalyticsOverviewDTO,
  BudgetDTO,
  ExpenseDTO,
  HouseholdDTO,
  ReferenceCategoryDTO,
} from '@/features/home/types'
import { getHouseholdDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel, formatTimeLabel } from '@/lib/formatters'
import { getCurrentPeriod } from '@/lib/period'
import { impact, selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

export const FinanceSummaryCard = ({
  householdId,
  period = getCurrentPeriod(),
  title = 'Tổng chi tháng này',
}: {
  householdId?: string
  period?: string
  title?: string
}) => {
  const overviewParams = householdId
    ? { household_id: householdId, period }
    : { period }
  const overviewQuery = useAnalyticsOverviewQuery(overviewParams)
  const comparisonQuery = useAnalyticsComparisonQuery(overviewParams)
  const budgetQuery = useQuery({
    ...budgetListQueryOptions(householdId ?? 'unknown', period),
    enabled: Boolean(householdId),
  })
  const overview = overviewQuery.data
  const budget = budgetQuery.data?.items[0] ?? null
  const budgetProgress = overview
    ? getBudgetProgress(overview.totalSpendMinor, budget)
    : null
  const isLoading =
    !overview &&
    (overviewQuery.isLoading ||
      comparisonQuery.isLoading ||
      budgetQuery.isLoading)
  const isError =
    !overview && Boolean(overviewQuery.error || comparisonQuery.error)

  return (
    <DataState
      errorDescription='Không tải được tổng quan tháng này. Kiểm tra kết nối rồi thử lại.'
      errorTitle='Không tải được tổng quan'
      isError={isError}
      isLoading={isLoading}
      loadingDescription='Đang đồng bộ số liệu chi tiêu tháng này.'
      loadingTitle='Đang tải tổng quan'
      retryAction={async () => {
        await Promise.all([
          overviewQuery.refetch(),
          comparisonQuery.refetch(),
          budgetQuery.refetch(),
        ])
      }}>
      <Card className='grid gap-4 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <Eyebrow>{title}</Eyebrow>
            <MoneyLabel className='mt-1 block text-[30px] leading-none font-extrabold tracking-normal'>
              {overview
                ? formatCurrencyMinor(
                    overview.totalSpendMinor,
                    overview.currencyCode,
                  )
                : '—'}
            </MoneyLabel>
          </div>
          <Chip tone='primary'>
            {overviewQuery.isFetching || comparisonQuery.isFetching
              ? 'Đang cập nhật'
              : getComparisonLabel(
                  comparisonQuery.data,
                  overview?.expenseCount ?? 0,
                )}
          </Chip>
        </div>

        {budgetProgress ? (
          <div className='grid gap-2'>
            <div className='h-3 overflow-hidden rounded-full bg-black/[0.07]'>
              <span
                className='block h-full rounded-full bg-gradient-to-r from-tma-primary to-[#7ca8ff] shadow-[0_6px_14px_rgba(63,124,255,0.22)]'
                style={{
                  width: `${Math.min(budgetProgress.percentUsed, 100)}%`,
                }}
              />
            </div>
            <div className='flex items-center justify-between gap-3 text-xs font-semibold text-tma-text-muted'>
              <span>Đã dùng {budgetProgress.percentUsed}% ngân sách</span>
              <span>
                {budgetProgress.isOverBudget ? 'Vượt ' : 'Còn '}
                <MoneyLabel>
                  {formatCurrencyMinor(
                    Math.abs(budgetProgress.remainingMinor),
                    budget?.currencyCode ?? overview?.currencyCode ?? 'VND',
                  )}
                </MoneyLabel>
              </span>
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-between gap-3 text-xs font-semibold text-tma-text-muted'>
            <span>{overview?.expenseCount ?? 0} khoản chi</span>
            <span>
              {budget
                ? getHouseholdBudgetLabel(overview?.totalSpendMinor, budget)
                : 'Tháng hiện tại'}
            </span>
          </div>
        )}
      </Card>
    </DataState>
  )
}

export const ShortcutItem = ({
  accent,
  disabled,
  hint,
  href,
  icon: Icon,
  title,
}: {
  accent: { background: string; foreground: string }
  disabled?: boolean
  hint: string
  href: string
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement
  title: string
}) => {
  const content = (
    <>
      <div className='flex items-start justify-between gap-3'>
        <IconBadge accent={accent}>
          <Icon height={20} strokeWidth={2.1} width={20} />
        </IconBadge>
        {disabled ? <Chip tone='warning'>Sớm có</Chip> : null}
      </div>
      <div>
        <h3 className='m-0 text-[15px] leading-tight font-semibold text-tma-text-strong'>
          {title}
        </h3>
        <p className='m-0 mt-1 text-xs leading-normal text-tma-text-muted'>
          {hint}
        </p>
      </div>
    </>
  )

  const className =
    'grid min-h-28 content-start gap-3 rounded-[20px] border border-black/[0.04] bg-white p-3.5 shadow-tma-soft transition active:scale-[0.98]'

  if (disabled) {
    return (
      <div aria-disabled='true' className={cn(className, 'opacity-75')}>
        {content}
      </div>
    )
  }

  return (
    <Link
      className={className}
      to={href}
      onClick={() => {
        impact('light')
      }}>
      {content}
    </Link>
  )
}

export const ExpenseItem = ({
  expense,
  householdLabel,
  referenceCategories,
  showHouseholdLabel = true,
}: {
  expense: ExpenseDTO
  householdLabel?: string | null
  referenceCategories?: ReferenceCategoryDTO[]
  showHouseholdLabel?: boolean
}) => {
  const navigate = useNavigate()
  const category = getCategoryPresentation(
    expense.categoryKey,
    referenceCategories,
  )
  const groupLabel = getExpenseGroupLabel(expense.groupIds)

  const openDetail = () => {
    selection()
    navigate(`/expenses/${expense.id}`)
  }

  return (
    <article
      className='flex cursor-pointer items-start gap-3 rounded-[20px] bg-tma-card-plain p-3.5 shadow-tma-soft transition active:scale-[0.99]'
      role='button'
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter') openDetail()
      }}>
      <TmaMonogramBadge
        accent={category.accent}
        label={category.symbol}
        size='sm'
      />
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <h3 className='m-0 truncate text-[15px] leading-tight font-semibold text-tma-text-strong'>
              {expense.title.trim() || category.label}
            </h3>
            <p className='m-0 mt-1 line-clamp-2 text-sm leading-normal text-tma-text-muted'>
              {getExpenseSecondaryText(expense.note, category.label)}
            </p>
          </div>
          <MoneyLabel className='shrink-0 text-sm font-bold'>
            {formatCurrencyMinor(expense.amountMinor, expense.currencyCode)}
          </MoneyLabel>
        </div>
        <div className='mt-2 flex flex-wrap gap-1.5'>
          <Chip className='min-h-6 px-2 text-[11px]'>
            {formatTimeLabel(new Date(expense.occurredAt).toISOString())}
          </Chip>
          {showHouseholdLabel && householdLabel ? (
            <Chip className='min-h-6 px-2 text-[11px]'>{householdLabel}</Chip>
          ) : null}
          {groupLabel ? (
            <Chip className='min-h-6 px-2 text-[11px]'>{groupLabel}</Chip>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export const RecentExpenses = ({
  groupId,
  householdId,
  limit = 10,
  showHouseholdLabel = true,
  title = 'Lịch sử gần đây',
  viewAllHref = TMA_PATHS.expenses,
}: {
  groupId?: string
  householdId?: string
  limit?: number
  showHouseholdLabel?: boolean
  title?: string
  viewAllHref?: string
}) => {
  const recentExpensesQuery = useExpenseListQuery({
    group_id: groupId,
    household_id: householdId,
    limit,
    sort: 'occurred_at_desc',
  })
  const householdsQuery = useHouseholdsQuery()
  const referenceCategoriesQuery = useReferenceCategoriesQuery()
  const householdNameById = buildHouseholdNameMap(
    householdsQuery.data?.items ?? [],
  )
  const recentExpenses = recentExpensesQuery.data?.items ?? []

  return (
    <Section>
      <SectionHeader
        action={
          <TmaInlineAction href={viewAllHref}>Xem tất cả</TmaInlineAction>
        }
        title={title}
      />
      <DataState
        emptyDescription='Tạo giao dịch mới để danh sách này hiện dữ liệu thật.'
        emptyTitle='Chưa có chi tiêu gần đây'
        errorDescription='API chi tiêu đang lỗi hoặc phiên hiện tại chưa thấy dữ liệu.'
        errorTitle='Không tải được lịch sử chi tiêu'
        isEmpty={
          !recentExpensesQuery.isLoading &&
          recentExpenses.length === 0 &&
          !recentExpensesQuery.isError
        }
        isError={recentExpensesQuery.isError && recentExpenses.length === 0}
        isLoading={recentExpensesQuery.isLoading && recentExpenses.length === 0}
        loadingDescription='Danh sách sẽ xuất hiện ngay khi truy vấn đầu tiên hoàn tất.'
        loadingTitle='Đang tải lịch sử chi tiêu'
        retryAction={recentExpensesQuery.refetch}>
        <div className='grid gap-2 rounded-[24px] border border-white/70 bg-tma-card-bg p-3 shadow-tma-card'>
          {recentExpenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              householdLabel={
                expense.householdId
                  ? householdNameById.get(expense.householdId)
                  : null
              }
              referenceCategories={referenceCategoriesQuery.data?.items}
              showHouseholdLabel={showHouseholdLabel}
            />
          ))}
        </div>
      </DataState>
    </Section>
  )
}

export const ExpenseTimeline = ({
  expenses,
  householdNameById,
  referenceCategories,
}: {
  expenses: ExpenseDTO[]
  householdNameById: Map<string, string>
  referenceCategories?: ReferenceCategoryDTO[]
}) => {
  const sections = new Map<string, ExpenseDTO[]>()

  for (const expense of expenses) {
    const label = formatDateLabel(new Date(expense.occurredAt).toISOString())
    sections.set(label, [...(sections.get(label) ?? []), expense])
  }

  return (
    <section className='grid gap-5'>
      {[...sections.entries()].map(([label, items]) => (
        <div key={label} className='grid gap-2.5'>
          <h2 className='m-0 px-1 text-xl leading-tight font-extrabold text-tma-text-strong'>
            {label}
          </h2>
          <div className='grid gap-2'>
            {items.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                householdLabel={
                  expense.householdId
                    ? householdNameById.get(expense.householdId)
                    : null
                }
                referenceCategories={referenceCategories}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

interface HouseholdCardViewModel {
  budget: BudgetDTO | null
  currencyCode?: string
  household: HouseholdDTO
  isError?: boolean
  isLoading?: boolean
  memberCount?: number
  overview?: AnalyticsOverviewDTO
  totalSpendMinor?: number
}

export const HouseholdPreviewItem = ({
  card,
}: {
  card: HouseholdCardViewModel
}) => (
  <Link
    className='grid min-w-[220px] gap-3 rounded-[22px] bg-white p-3.5 shadow-tma-soft transition active:scale-[0.98]'
    to={getHouseholdDetailPath(card.household.id)}
    onClick={() => impact('light')}>
    <div className='flex items-center justify-between gap-3'>
      <Avatar
        alt={card.household.name}
        fallback={resolveInitials(card.household.name)}
        size='sm'
        src={card.household.avatarUrl}
      />
      <Chip>
        {card.memberCount != null
          ? `${card.memberCount} thành viên`
          : 'Đang tải'}
      </Chip>
    </div>
    <div>
      <h3 className='m-0 text-[15px] font-semibold text-tma-text-strong'>
        {card.household.name}
      </h3>
      <MoneyLabel className='mt-1 block text-sm font-bold'>
        {card.totalSpendMinor != null && card.currencyCode
          ? formatCurrencyMinor(card.totalSpendMinor, card.currencyCode)
          : card.isLoading
            ? 'Đang tải...'
            : '—'}
      </MoneyLabel>
    </div>
    <CardDescription>
      {card.isError
        ? 'Không tải được tổng quan gia đình.'
        : getHouseholdBudgetLabel(card.totalSpendMinor, card.budget)}
    </CardDescription>
  </Link>
)

export const HouseholdItem = ({
  action,
  card,
  roleLabel,
}: {
  action?: ReactNode
  card: HouseholdCardViewModel
  roleLabel: string
}) => (
  <Link
    className='grid gap-3 rounded-[24px] bg-white p-4 shadow-tma-card transition active:scale-[0.99]'
    to={getHouseholdDetailPath(card.household.id)}
    onClick={() => impact('light')}>
    <div className='flex items-center justify-between gap-3'>
      <Avatar
        alt={card.household.name}
        fallback={resolveInitials(card.household.name)}
        size='lg'
        src={card.household.avatarUrl}
      />
      <Chip tone='primary'>{roleLabel}</Chip>
    </div>
    <div>
      <CardTitle>{card.household.name}</CardTitle>
      <CardDescription>
        {card.memberCount != null
          ? `${card.memberCount} thành viên`
          : 'Đang tải thành viên'}
      </CardDescription>
    </div>
    <div className='grid grid-cols-2 gap-2.5'>
      <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
        <Eyebrow>Chi tháng này</Eyebrow>
        <MoneyLabel className='text-sm font-bold'>
          {card.totalSpendMinor != null && card.currencyCode
            ? formatCurrencyMinor(card.totalSpendMinor, card.currencyCode)
            : card.isLoading
              ? 'Đang tải...'
              : '—'}
        </MoneyLabel>
      </div>
      <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
        <Eyebrow>Ngân sách</Eyebrow>
        <strong className='text-sm text-tma-text-strong'>
          {getHouseholdBudgetLabel(card.totalSpendMinor, card.budget)}
        </strong>
      </div>
    </div>
    <div className='flex items-center justify-between text-sm text-tma-text-muted'>
      <span>Mở chi tiết</span>
      {action ?? <span>{card.household.defaultCurrencyCode}</span>}
    </div>
  </Link>
)

export const HouseholdPreviewCarousel = () => {
  const period = getCurrentPeriod()
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []

  const memberQueries = useQueries({
    queries: households.map((household) =>
      householdMembersQueryOptions(household.id),
    ),
  })
  const overviewQueries = useQueries({
    queries: households.map((household) =>
      analyticsOverviewQueryOptions({ household_id: household.id, period }),
    ),
  })
  const budgetQueries = useQueries({
    queries: households.map((household) =>
      budgetListQueryOptions(household.id, period),
    ),
  })

  const cards: HouseholdCardViewModel[] = households
    .map((household, index) => ({
      household,
      budget: budgetQueries[index]?.data?.items[0] ?? null,
      currencyCode: overviewQueries[index]?.data?.currencyCode,
      isError: Boolean(
        memberQueries[index]?.error ||
        overviewQueries[index]?.error ||
        budgetQueries[index]?.error,
      ),
      isLoading: Boolean(
        memberQueries[index]?.isLoading ||
        overviewQueries[index]?.isLoading ||
        budgetQueries[index]?.isLoading,
      ),
      memberCount: memberQueries[index]?.data?.items.length,
      overview: overviewQueries[index]?.data,
      totalSpendMinor: overviewQueries[index]?.data?.totalSpendMinor,
    }))
    .sort(
      (left, right) =>
        (right.totalSpendMinor ?? Number.NEGATIVE_INFINITY) -
        (left.totalSpendMinor ?? Number.NEGATIVE_INFINITY),
    )

  return (
    <Section>
      <SectionHeader title='Gia đình' />
      <DataState
        emptyDescription='Home vẫn hiển thị chi tiêu cá nhân, còn thẻ gia đình sẽ xuất hiện khi có membership.'
        emptyTitle='Chưa tham gia gia đình nào'
        errorDescription='Kiểm tra phiên đăng nhập hoặc dữ liệu seed local rồi mở lại Mini App.'
        errorTitle='Không tải được danh sách gia đình'
        isEmpty={
          !householdsQuery.isLoading &&
          !householdsQuery.isError &&
          cards.length === 0
        }
        isError={householdsQuery.isError}
        isLoading={householdsQuery.isLoading && cards.length === 0}
        loadingDescription='Thẻ household sẽ xuất hiện ngay khi các truy vấn đầu tiên hoàn tất.'
        loadingTitle='Đang tải danh sách gia đình'
        retryAction={householdsQuery.refetch}>
        <div className='-mr-1 grid auto-cols-[minmax(220px,78%)] grid-flow-col gap-2.5 overflow-x-auto px-0.5 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {cards.map((card) => (
            <HouseholdPreviewItem key={card.household.id} card={card} />
          ))}
        </div>
      </DataState>
    </Section>
  )
}

export const LinkButton = ({
  children,
  className,
  to,
  variant = 'primary',
}: {
  children: ReactNode
  className?: string
  to: string
  variant?: ButtonVariant
}) => (
  <Link className={buttonVariants({ className, variant })} to={to}>
    {children}
  </Link>
)
