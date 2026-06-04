import { useQueries } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'

import {
  TmaInlineAction,
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { useAuth } from '@/features/auth/auth-provider'
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
  resolveUserName,
} from '@/features/home/presentation'
import type {
  AnalyticsOverviewDTO,
  BudgetDTO,
  HouseholdDTO,
} from '@/features/home/types'
import { getHouseholdDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatMonthLabel, formatTimeLabel } from '@/lib/formatters'
import { getCurrentPeriod } from '@/lib/period'
import { impact, selection } from '@/lib/telegram/haptics'

const shortcutItems = [
  {
    title: 'Chi tiêu',
    hint: 'Lịch sử và bộ lọc đầy đủ',
    href: TMA_PATHS.expenses,
    symbol: 'CT',
    accent: { background: '#edf4ff', foreground: '#3f7cff' },
    enabled: true,
  },
  {
    title: 'Gia đình',
    hint: 'Danh sách thành viên và ngân sách',
    href: TMA_PATHS.households,
    symbol: 'GD',
    accent: { background: '#eef9f0', foreground: '#2f9b44' },
    enabled: true,
  },
  {
    title: 'Nhóm',
    hint: 'Theo dõi chi tiêu nhóm nhỏ',
    href: '#',
    symbol: 'NH',
    accent: { background: '#fff3e8', foreground: '#ff8a3d' },
    enabled: false,
  },
  {
    title: 'Ngân sách',
    hint: 'Xem mức còn lại trong tháng',
    href: '#',
    symbol: 'NS',
    accent: { background: '#fff6d9', foreground: '#b48800' },
    enabled: false,
  },
] as const

interface HouseholdCardViewModel {
  household: HouseholdDTO
  budget: BudgetDTO | null
  currencyCode?: string
  isError: boolean
  isLoading: boolean
  memberCount?: number
  overview?: AnalyticsOverviewDTO
  totalSpendMinor?: number
}

export const HomePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const period = getCurrentPeriod()
  const userName = resolveUserName(
    user?.displayName ?? null,
    user?.email ?? null,
  )
  const householdsQuery = useHouseholdsQuery()
  const referenceCategoriesQuery = useReferenceCategoriesQuery()
  const recentExpensesQuery = useExpenseListQuery({
    limit: 10,
    sort: 'occurred_at_desc',
  })
  const fallbackOverviewQuery = useAnalyticsOverviewQuery({ period })
  const fallbackComparisonQuery = useAnalyticsComparisonQuery({ period })
  const households = householdsQuery.data?.items ?? []

  const householdMemberQueries = useQueries({
    queries: households.map((household) =>
      householdMembersQueryOptions(household.id),
    ),
  })
  const householdOverviewQueries = useQueries({
    queries: households.map((household) =>
      analyticsOverviewQueryOptions({
        household_id: household.id,
        period,
      }),
    ),
  })
  const householdBudgetQueries = useQueries({
    queries: households.map((household) =>
      budgetListQueryOptions(household.id, period),
    ),
  })

  const householdCards: HouseholdCardViewModel[] = households
    .map((household, index) => {
      const membersQuery = householdMemberQueries[index]
      const overviewQuery = householdOverviewQueries[index]
      const budgetQuery = householdBudgetQueries[index]

      return {
        household,
        budget: budgetQuery?.data?.items[0] ?? null,
        currencyCode: overviewQuery?.data?.currencyCode,
        isError: Boolean(
          membersQuery?.error || overviewQuery?.error || budgetQuery?.error,
        ),
        isLoading: Boolean(
          membersQuery?.isLoading ||
          overviewQuery?.isLoading ||
          budgetQuery?.isLoading,
        ),
        memberCount: membersQuery?.data?.items.length,
        overview: overviewQuery?.data,
        totalSpendMinor: overviewQuery?.data?.totalSpendMinor,
      }
    })
    .sort(
      (left, right) =>
        (right.totalSpendMinor ?? Number.NEGATIVE_INFINITY) -
        (left.totalSpendMinor ?? Number.NEGATIVE_INFINITY),
    )
  const householdNameById = new Map(
    householdCards.map((item) => [item.household.id, item.household.name]),
  )
  const featuredHousehold = householdCards[0]
  const featuredComparisonQuery = useAnalyticsComparisonQuery(
    {
      household_id: featuredHousehold?.household.id,
      period,
    },
    { enabled: Boolean(featuredHousehold?.household.id) },
  )

  const summaryOverview =
    featuredHousehold?.overview ?? fallbackOverviewQuery.data
  const summaryComparison = featuredHousehold
    ? featuredComparisonQuery.data
    : fallbackComparisonQuery.data
  const summaryBudget = featuredHousehold?.budget ?? null
  const summaryLoading = featuredHousehold
    ? featuredHousehold.isLoading || featuredComparisonQuery.isLoading
    : fallbackOverviewQuery.isLoading || fallbackComparisonQuery.isLoading
  const summaryError = featuredHousehold
    ? featuredHousehold.isError || Boolean(featuredComparisonQuery.error)
    : Boolean(fallbackOverviewQuery.error || fallbackComparisonQuery.error)
  const summaryBudgetProgress = summaryOverview
    ? getBudgetProgress(summaryOverview.totalSpendMinor, summaryBudget)
    : null
  const recentExpenses = recentExpensesQuery.data?.items ?? []
  const referenceCategories = referenceCategoriesQuery.data?.items
  const latestExpense = recentExpenses[0]
  const latestCategory = getCategoryPresentation(
    latestExpense?.categoryKey,
    referenceCategories,
  )
  const topCategory = summaryOverview?.topCategories[0]
  const topCategoryPresentation = getCategoryPresentation(
    topCategory?.categoryKey,
    referenceCategories,
  )

  const headerSubtitle = featuredHousehold ? (
    featuredHousehold.totalSpendMinor != null &&
    featuredHousehold.currencyCode ? (
      <>
        Đã dùng{' '}
        <span className='font-mono'>
          {formatCurrencyMinor(
            featuredHousehold.totalSpendMinor,
            featuredHousehold.currencyCode,
          )}
        </span>{' '}
        tại {featuredHousehold.household.name}.
      </>
    ) : (
      `Đang đồng bộ chi tiêu tại ${featuredHousehold.household.name}.`
    )
  ) : fallbackOverviewQuery.data ? (
    `Đã ghi nhận ${fallbackOverviewQuery.data.expenseCount} khoản chi trong tháng này.`
  ) : (
    'Đang đồng bộ chi tiêu tháng này.'
  )

  return (
    <TmaPageShell closeAction title='Trang chủ'>
      <TmaPageHeader
        eyebrow='Xin chào'
        leading={
          user?.avatarUrl ? (
            <img
              alt={userName}
              className='tma-avatar-image'
              src={user.avatarUrl}
            />
          ) : (
            <span>{resolveInitials(userName)}</span>
          )
        }
        subtitle={headerSubtitle}
        title={userName}
        trailing={
          <span className='tma-chip tma-chip--strong'>
            {formatMonthLabel(new Date())}
          </span>
        }
      />

      <section className='tma-summary-card tma-summary-card--home'>
        <div className='tma-summary-card__topline'>
          <div>
            <p className='tma-section-label'>
              {featuredHousehold
                ? 'Tổng chi gia đình tháng này'
                : 'Tổng chi tháng này'}
            </p>
            <strong className='font-mono'>
              {summaryOverview
                ? formatCurrencyMinor(
                    summaryOverview.totalSpendMinor,
                    summaryOverview.currencyCode,
                  )
                : summaryLoading
                  ? 'Đang tải...'
                  : '—'}
            </strong>
          </div>

          <span className='tma-status-pill'>
            {summaryError
              ? 'Lỗi dữ liệu'
              : summaryLoading
                ? 'Đang cập nhật'
                : getComparisonLabel(
                    summaryComparison,
                    summaryOverview?.expenseCount ?? 0,
                  )}
          </span>
        </div>

        {summaryBudgetProgress ? (
          <div className='tma-summary-card__meter'>
            <div className='tma-summary-card__meter-track'>
              <span
                className='tma-summary-card__meter-fill'
                style={{
                  width: `${Math.min(summaryBudgetProgress.percentUsed, 100)}%`,
                }}
              />
            </div>

            <div className='tma-summary-card__meter-meta'>
              <span>
                Đã dùng {summaryBudgetProgress.percentUsed}% ngân sách
              </span>
              <span>
                {summaryBudgetProgress.isOverBudget ? 'Vượt ' : 'Còn '}
                <span className='font-mono'>
                  {formatCurrencyMinor(
                    Math.abs(summaryBudgetProgress.remainingMinor),
                    summaryBudget?.currencyCode ??
                      summaryOverview?.currencyCode ??
                      'VND',
                  )}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div className='tma-summary-card__meter-meta'>
            <span>{summaryOverview?.expenseCount ?? 0} khoản chi</span>
            <span>
              {featuredHousehold ? featuredHousehold.household.name : 'Cá nhân'}
            </span>
          </div>
        )}

        <div className='tma-summary-card__insights'>
          <article className='tma-summary-card__insight'>
            <span>Mạnh nhất</span>
            <strong>{topCategoryPresentation.label}</strong>
            <p>
              {topCategory
                ? `${Math.round(topCategory.percentOfTotal)}% tổng chi • ${topCategory.expenseCount} khoản`
                : 'Chưa có phân bổ danh mục trong kỳ này.'}
            </p>
          </article>

          <article className='tma-summary-card__insight'>
            <span>Chi gần nhất</span>
            <strong>{latestExpense?.title || 'Chưa có giao dịch mới'}</strong>
            <p>
              {latestExpense ? (
                <>
                  <span className='font-mono'>
                    {formatCurrencyMinor(
                      latestExpense.amountMinor,
                      latestExpense.currencyCode,
                    )}
                  </span>{' '}
                  • {latestCategory.label}
                </>
              ) : (
                'Dữ liệu sẽ hiện khi có giao dịch đầu tiên.'
              )}
            </p>
          </article>
        </div>
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <h2 className='tma-section__title'>Lối tắt</h2>
        </div>

        <div className='tma-shortcuts-grid'>
          {shortcutItems.map((item) => {
            const content = (
              <>
                <div className='tma-shortcut-card__head'>
                  <TmaMonogramBadge accent={item.accent} label={item.symbol} />
                  {!item.enabled ? (
                    <span className='tma-status-pill'>Sớm có</span>
                  ) : null}
                </div>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.hint}</p>
                </div>
              </>
            )

            if (!item.enabled) {
              return (
                <div
                  key={item.title}
                  aria-disabled='true'
                  className='tma-shortcut-card is-disabled'>
                  {content}
                </div>
              )
            }

            return (
              <Link
                key={item.title}
                className='tma-shortcut-card'
                to={item.href}
                onClick={() => {
                  impact('light')
                }}>
                {content}
              </Link>
            )
          })}
        </div>
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <h2 className='tma-section__title'>Gia đình</h2>
        </div>

        {householdsQuery.isError ? (
          <div className='tma-empty-card'>
            <h2>Không tải được danh sách gia đình</h2>
            <p>
              Kiểm tra phiên đăng nhập hoặc dữ liệu seed local rồi mở lại Mini
              App.
            </p>
          </div>
        ) : householdsQuery.isLoading ? (
          <div className='tma-empty-card'>
            <h2>Đang tải danh sách gia đình</h2>
            <p>
              Thẻ household sẽ xuất hiện ngay khi các truy vấn đầu tiên hoàn
              tất.
            </p>
          </div>
        ) : householdCards.length === 0 ? (
          <div className='tma-empty-card'>
            <h2>Chưa tham gia gia đình nào</h2>
            <p>
              Home vẫn hiển thị chi tiêu cá nhân, còn thẻ gia đình sẽ xuất hiện
              khi có membership.
            </p>
          </div>
        ) : (
          <div className='tma-household-carousel'>
            {householdCards.map((householdCard) => (
              <Link
                key={householdCard.household.id}
                className='tma-household-card'
                to={getHouseholdDetailPath(householdCard.household.id)}
                onClick={() => impact('light')}>
                <div className='tma-household-card__top'>
                  <div className='tma-household-avatar tma-household-avatar--sm'>
                    {householdCard.household.avatarUrl ? (
                      <img
                        alt={householdCard.household.name}
                        className='tma-avatar-image'
                        src={householdCard.household.avatarUrl}
                      />
                    ) : (
                      <span>
                        {resolveInitials(householdCard.household.name)}
                      </span>
                    )}
                  </div>
                  <span className='tma-soft-pill'>
                    {householdCard.memberCount != null
                      ? `${householdCard.memberCount} thành viên`
                      : 'Đang tải thành viên'}
                  </span>
                </div>

                <div>
                  <h3>{householdCard.household.name}</h3>
                  <strong className='font-mono'>
                    {householdCard.totalSpendMinor != null &&
                    householdCard.currencyCode
                      ? formatCurrencyMinor(
                          householdCard.totalSpendMinor,
                          householdCard.currencyCode,
                        )
                      : householdCard.isLoading
                        ? 'Đang tải...'
                        : '—'}
                  </strong>
                </div>

                <p>
                  {householdCard.isError
                    ? 'Không tải được tổng quan gia đình.'
                    : getHouseholdBudgetLabel(
                        householdCard.totalSpendMinor,
                        householdCard.budget,
                      )}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <h2 className='tma-section__title'>Lịch sử gần đây</h2>
          <TmaInlineAction href={TMA_PATHS.expenses}>
            Xem tất cả
          </TmaInlineAction>
        </div>

        {recentExpensesQuery.isError && recentExpenses.length === 0 ? (
          <div className='tma-empty-card'>
            <h2>Không tải được lịch sử chi tiêu</h2>
            <p>
              API chi tiêu đang lỗi hoặc account hiện tại chưa thấy dữ liệu
              household đã seed.
            </p>
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className='tma-empty-card'>
            <h2>
              {recentExpensesQuery.isLoading
                ? 'Đang tải lịch sử chi tiêu'
                : 'Chưa có chi tiêu gần đây'}
            </h2>
            <p>
              {recentExpensesQuery.isLoading
                ? 'Danh sách sẽ xuất hiện ngay khi truy vấn đầu tiên hoàn tất.'
                : 'Tạo giao dịch mới hoặc seed local để home-page hiện dữ liệu thật.'}
            </p>
          </div>
        ) : (
          <div className='tma-list-card'>
            {recentExpenses.map((expense) => {
              const category = getCategoryPresentation(
                expense.categoryKey,
                referenceCategories,
              )
              const groupLabel = getExpenseGroupLabel(expense.groupIds)
              const householdLabel = expense.householdId
                ? householdNameById.get(expense.householdId)
                : null

              return (
                <article
                  key={expense.id}
                  className='tma-expense-row'
                  role='button'
                  tabIndex={0}
                  onClick={() => {
                    selection()
                    navigate(`/expenses/${expense.id}`)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      selection()
                      navigate(`/expenses/${expense.id}`)
                    }
                  }}>
                  <TmaMonogramBadge
                    accent={category.accent}
                    label={category.symbol}
                    size='sm'
                  />
                  <div className='tma-expense-row__body'>
                    <div className='tma-expense-row__title-line'>
                      <h3>{expense.title.trim() || category.label}</h3>
                      <strong className='font-mono'>
                        {formatCurrencyMinor(
                          expense.amountMinor,
                          expense.currencyCode,
                        )}
                      </strong>
                    </div>
                    <p>
                      {getExpenseSecondaryText(expense.note, category.label)}
                    </p>
                    <div className='tma-expense-row__meta'>
                      <span>
                        {formatTimeLabel(
                          new Date(expense.occurredAt).toISOString(),
                        )}
                      </span>
                      {householdLabel ? <span>{householdLabel}</span> : null}
                      {groupLabel ? <span>{groupLabel}</span> : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </TmaPageShell>
  )
}
