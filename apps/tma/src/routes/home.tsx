import { Link, useNavigate } from 'react-router-dom'

import {
  TmaInlineAction,
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { useAuth } from '@/features/auth/auth-provider'
import {
  useAnalyticsComparisonQuery,
  useAnalyticsOverviewQuery,
  useExpenseListQuery,
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { HomeHouseholdsSection } from '@/features/home/components/home-households-section'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
  getComparisonLabel,
  getExpenseGroupLabel,
  getExpenseSecondaryText,
  resolveUserName,
} from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'
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
  const summaryOverviewQuery = useAnalyticsOverviewQuery({ period })
  const summaryComparisonQuery = useAnalyticsComparisonQuery({ period })

  const householdNameById = new Map(
    (householdsQuery.data?.items ?? []).map((household) => [
      household.id,
      household.name,
    ]),
  )

  const summaryOverview = summaryOverviewQuery.data
  const summaryComparison = summaryComparisonQuery.data
  const summaryLoading =
    summaryOverviewQuery.isLoading || summaryComparisonQuery.isLoading
  const summaryError = Boolean(
    summaryOverviewQuery.error || summaryComparisonQuery.error,
  )
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

  return (
    <TmaPageShell title='Trang chủ'>
      <TmaPageHeader
        leading={
          <img
            alt={userName}
            className='tma-avatar-image'
            src={user?.avatarUrl ?? undefined}
          />
        }
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
            <p className='tma-section-label'>Tổng chi tháng này</p>
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

        <div className='tma-summary-card__meter-meta'>
          <span>{summaryOverview?.expenseCount ?? 0} khoản chi</span>
          <span>Cá nhân</span>
        </div>

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

      <HomeHouseholdsSection />

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
