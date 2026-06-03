import { Link } from 'react-router-dom'

import {
  TmaInlineAction,
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
  TmaPageTitleBar,
} from '@/components/shared/tma-page-shell'
import { useAuth } from '@/features/auth/auth-provider'
import {
  findCategory,
  householdOptions,
  recentExpenses,
} from '@/features/finance/mock-data'
import { formatMonthLabel, formatTimeLabel, formatVnd } from '@/lib/formatters'
import { impact, selection } from '@/lib/telegram/haptics'

const shortcutItems = [
  {
    title: 'Chi tiêu',
    hint: 'Lịch sử và bộ lọc đầy đủ',
    href: '/expenses',
    symbol: 'CT',
    accent: { background: '#edf4ff', foreground: '#3f7cff' },
    enabled: true,
  },
  {
    title: 'Gia đình',
    hint: 'Danh sách thành viên và ngân sách',
    href: '#',
    symbol: 'GD',
    accent: { background: '#eef9f0', foreground: '#2f9b44' },
    enabled: false,
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
]

const resolveUserName = (
  displayName: string | null,
  email: string | null,
): string => {
  if (displayName && displayName.trim().length > 0) {
    return displayName
  }

  if (email && email.includes('@')) {
    return email.split('@')[0]
  }

  return 'Bạn'
}

const resolveInitials = (value: string): string =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const HomePage = () => {
  const { user } = useAuth()
  const userName = resolveUserName(
    user?.displayName ?? null,
    user?.email ?? null,
  )
  const featuredHousehold = householdOptions[0]
  const latestExpense = recentExpenses[0]
  const latestCategory = findCategory(latestExpense.categoryId)
  const totalSpent = 12650000
  const remainingBudget = 2340000
  const budgetProgress = Math.round(
    (totalSpent / (totalSpent + remainingBudget)) * 100,
  )

  return (
    <TmaPageShell closeAction>
      <TmaPageTitleBar title='Trang chủ' />
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
        subtitle={`${featuredHousehold.name} đang dùng ${formatVnd(featuredHousehold.monthSpend)} trong ${formatMonthLabel(new Date()).toLowerCase()}.`}
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
            <strong>{formatVnd(totalSpent)}</strong>
          </div>

          <span className='tma-status-pill'>+6% so với tháng trước</span>
        </div>

        <div className='tma-summary-card__meter'>
          <div className='tma-summary-card__meter-track'>
            <span
              className='tma-summary-card__meter-fill'
              style={{ width: `${budgetProgress}%` }}
            />
          </div>

          <div className='tma-summary-card__meter-meta'>
            <span>Đã dùng {budgetProgress}% ngân sách</span>
            <span>Còn {formatVnd(remainingBudget)}</span>
          </div>
        </div>

        <div className='tma-summary-card__insights'>
          <article className='tma-summary-card__insight'>
            <span>Mạnh nhất</span>
            <strong>Mua sắm</strong>
            <p>Biến động lớn nhất trong nhịp chi tiêu tháng này.</p>
          </article>

          <article className='tma-summary-card__insight'>
            <span>Chi gần nhất</span>
            <strong>{latestExpense.title}</strong>
            <p>
              {formatVnd(latestExpense.amount)} • {latestCategory.label}
            </p>
          </article>
        </div>
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Lối tắt</p>
            <h2 className='tma-section__title'>Đi thẳng vào phần hay dùng</h2>
          </div>
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
          <div>
            <p className='tma-section-label'>Gia đình</p>
            <h2 className='tma-section__title'>Bạn đang tham gia</h2>
          </div>
        </div>

        <div className='tma-household-carousel'>
          {householdOptions.map((household) => (
            <article
              key={household.id}
              className='tma-household-card'
              role='button'
              tabIndex={0}
              onClick={() => impact('light')}
              onKeyDown={(e) => e.key === 'Enter' && impact('light')}>
              <div className='tma-household-card__top'>
                <TmaMonogramBadge accent={household.accent} label='GD' />
                <span className='tma-soft-pill'>
                  {household.members} thành viên
                </span>
              </div>

              <div>
                <h3>{household.name}</h3>
                <strong>{formatVnd(household.monthSpend)}</strong>
              </div>

              <p>{household.budgetLabel}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Lịch sử gần đây</p>
            <h2 className='tma-section__title'>10 chi tiêu mới nhất</h2>
          </div>

          <TmaInlineAction href='/expenses'>Xem tất cả</TmaInlineAction>
        </div>

        <div className='tma-list-card'>
          {recentExpenses.map((expense) => {
            const category = findCategory(expense.categoryId)

            return (
              <article
                key={expense.id}
                className='tma-expense-row'
                role='button'
                tabIndex={0}
                onClick={() => selection()}
                onKeyDown={(e) => e.key === 'Enter' && selection()}>
                <TmaMonogramBadge
                  accent={category.accent}
                  label={category.symbol}
                  size='sm'
                />
                <div className='tma-expense-row__body'>
                  <div className='tma-expense-row__title-line'>
                    <h3>{expense.title}</h3>
                    <strong>{formatVnd(expense.amount)}</strong>
                  </div>
                  <p>{expense.note}</p>
                  <div className='tma-expense-row__meta'>
                    <span>{formatTimeLabel(expense.occurredAt)}</span>
                    {expense.household ? (
                      <span>{expense.household}</span>
                    ) : null}
                    {expense.group ? <span>{expense.group}</span> : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </TmaPageShell>
  )
}
