import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { TmaDataState } from '@/components/shared/tma-data-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { useAuth } from '@/features/auth/auth-provider'
import {
  formatCurrencyMinor,
  getBudgetProgress,
  getCategoryPresentation,
  getExpenseSecondaryText,
} from '@/features/home/presentation'
import { formatMonthLabel, formatTimeLabel } from '@/lib/formatters'
import { getCurrentPeriod } from '@/lib/period'

import {
  useHouseholdBudgetListQuery,
  useHouseholdDetailQuery,
  useHouseholdMembersQuery,
  useHouseholdOverviewQuery,
  useHouseholdRecentExpensesQuery,
  useReferenceCategoriesQuery,
  useUpdateHouseholdMutation,
} from '../api'
import { HouseholdAvatarSection } from '../components/household-avatar-section'
import {
  formatMemberCountLabel,
  getHouseholdAvatarFallback,
  getHouseholdRoleLabel,
} from '../presentation'

type HouseholdPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

export const HouseholdDetailPage = () => {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const period = getCurrentPeriod()
  const householdQuery = useHouseholdDetailQuery(id)
  const membersQuery = useHouseholdMembersQuery(id)
  const overviewQuery = useHouseholdOverviewQuery(id, period)
  const budgetQuery = useHouseholdBudgetListQuery(id, period)
  const recentExpensesQuery = useHouseholdRecentExpensesQuery(id)
  const referenceCategoriesQuery = useReferenceCategoriesQuery()
  const updateHouseholdMutation = useUpdateHouseholdMutation()
  const [draftName, setDraftName] = useState('')
  const [feedback, setFeedback] = useState<HouseholdPageFeedback | null>(
    () =>
      (location.state as { feedback?: HouseholdPageFeedback } | null)
        ?.feedback ?? null,
  )

  const household = householdQuery.data
  const members = membersQuery.data?.items ?? []
  const budget = budgetQuery.data?.items[0] ?? null
  const recentExpenses = recentExpensesQuery.data?.items ?? []
  const referenceCategories = referenceCategoriesQuery.data?.items
  const isAdmin = household?.role === 'admin'
  const isBusy = updateHouseholdMutation.isPending

  useEffect(() => {
    if (!household) {
      return
    }

    setDraftName(household.name)
  }, [household])

  const budgetProgress =
    household && overviewQuery.data
      ? getBudgetProgress(overviewQuery.data.totalSpendMinor, budget)
      : null

  const memberSummary = useMemo(
    () => formatMemberCountLabel(members.length),
    [members.length],
  )

  const handleAvatarUploaded = async (avatarUrl: string) => {
    if (!id) {
      return
    }

    await updateHouseholdMutation.mutateAsync({
      householdId: id,
      payload: { avatarUrl },
    })

    setFeedback({
      message: 'Đã cập nhật ảnh household thành công.',
      tone: 'success',
    })
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!id || !household || !isAdmin) {
      return
    }

    const payload: {
      avatarUrl?: string | null
      name?: string
    } = {}
    const normalizedName = draftName.trim()

    if (!normalizedName) {
      setFeedback({
        message: 'Tên household không được để trống.',
        tone: 'error',
      })

      return
    }

    if (normalizedName !== household.name) {
      payload.name = normalizedName
    }

    try {
      if (Object.keys(payload).length === 0) {
        setFeedback({
          message: 'Không có thay đổi mới để lưu.',
          tone: 'success',
        })

        return
      }

      await updateHouseholdMutation.mutateAsync({
        householdId: id,
        payload,
      })

      setFeedback({
        message: 'Đã cập nhật household thành công.',
        tone: 'success',
      })
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : 'Không thể cập nhật household lúc này.',
        tone: 'error',
      })
    }
  }

  if (!id) {
    return (
      <TmaPageShell title='Chi tiết gia đình'>
        <div className='tma-empty-card'>
          <h2>Household không hợp lệ</h2>
          <p>Đường dẫn hiện tại thiếu mã household để tải chi tiết.</p>
        </div>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title='Chi tiết gia đình'>
      {feedback ? (
        <section
          className={`tma-feedback-banner tma-feedback-banner--${feedback.tone}`}>
          <p>{feedback.message}</p>
        </section>
      ) : null}

      <TmaDataState
        errorDescription='Household này có thể không còn truy cập được, hoặc phiên đăng nhập hiện tại đã hết hạn.'
        errorTitle='Không tải được household'
        isError={householdQuery.isError && !household}
        isLoading={householdQuery.isLoading && !household}
        loadingDescription='Dữ liệu thành viên và chi tiêu sẽ hiện ngay sau khi đồng bộ xong.'
        loadingTitle='Đang tải chi tiết household'
        retryAction={householdQuery.refetch}>
        {household ? (
          <>
            <section className='tma-list-card tma-avatar-setup-card'>
              <HouseholdAvatarSection
                avatarUrl={household.avatarUrl}
                canEdit={isAdmin}
                helperText='Hỗ trợ ảnh vuông JPEG hoặc PNG, tối đa 8MB. Hệ thống sẽ tự căn giữa ảnh trước khi lưu.'
                householdName={household.name}
                isBusy={isBusy}
                readOnlyMessage='Chỉ quản trị viên mới có thể chỉnh tên và avatar của household.'
                summaryText={`${memberSummary} • ${getHouseholdRoleLabel(household.role)}`}
                onAvatarUploaded={handleAvatarUploaded}
              />
            </section>

            <section className='tma-summary-card tma-household-detail-summary'>
              <div className='tma-summary-card__topline'>
                <div>
                  <p className='tma-section-label'>Tổng quan tháng này</p>
                  <strong>
                    {overviewQuery.data
                      ? formatCurrencyMinor(
                          overviewQuery.data.totalSpendMinor,
                          overviewQuery.data.currencyCode,
                        )
                      : overviewQuery.isLoading
                        ? 'Đang tải...'
                        : '—'}
                  </strong>
                </div>

                <span className='tma-chip tma-chip--strong'>
                  {formatMonthLabel(new Date())}
                </span>
              </div>

              {budgetProgress ? (
                <div className='tma-summary-card__meter'>
                  <div className='tma-summary-card__meter-track'>
                    <span
                      className='tma-summary-card__meter-fill'
                      style={{
                        width: `${Math.min(budgetProgress.percentUsed, 100)}%`,
                      }}
                    />
                  </div>

                  <div className='tma-summary-card__meter-meta'>
                    <span>Đã dùng {budgetProgress.percentUsed}% ngân sách</span>
                    <span>
                      {budgetProgress.isOverBudget ? 'Vượt ' : 'Còn '}
                      <span className='font-mono-money'>
                        {formatCurrencyMinor(
                          Math.abs(budgetProgress.remainingMinor),
                          budget?.currencyCode ??
                            overviewQuery.data?.currencyCode ??
                            'VND',
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className='tma-summary-card__meter-meta'>
                  <span>{overviewQuery.data?.expenseCount ?? 0} khoản chi</span>
                  <span>{memberSummary}</span>
                </div>
              )}

              <div className='tma-household-meta-grid'>
                <article className='tma-household-meta-cell'>
                  <span>Múi giờ</span>
                  <strong>{household.timezone}</strong>
                </article>

                <article className='tma-household-meta-cell'>
                  <span>Tiền tệ</span>
                  <strong>{household.defaultCurrencyCode}</strong>
                </article>

                <article className='tma-household-meta-cell'>
                  <span>Quyền của bạn</span>
                  <strong>{getHouseholdRoleLabel(household.role)}</strong>
                </article>
              </div>
            </section>

            <section className='tma-section'>
              <div className='tma-section__header'>
                <div>
                  <p className='tma-section-label'>Thiết lập</p>
                  <h2 className='tma-section__title'>Thông tin household</h2>
                </div>
              </div>

              <section className='tma-list-card tma-household-form-card'>
                <form className='tma-household-form' onSubmit={handleSave}>
                  <label className='tma-field-block'>
                    <span>Tên household</span>
                    <input
                      className='tma-text-input'
                      disabled={!isAdmin || isBusy}
                      placeholder='Nhập tên household'
                      type='text'
                      value={draftName}
                      onChange={(event) => {
                        setDraftName(event.target.value)
                        setFeedback(null)
                      }}
                    />
                  </label>

                  {isAdmin ? (
                    <div className='tma-action-row'>
                      <button
                        className='tma-action-button tma-action-button--primary'
                        disabled={isBusy}
                        type='submit'>
                        {isBusy ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  ) : (
                    <p className='tma-household-form__note'>
                      Bạn có thể xem thông tin household và chi tiêu gần đây,
                      nhưng chỉ quản trị viên mới được chỉnh sửa.
                    </p>
                  )}
                </form>
              </section>
            </section>

            <section className='tma-section'>
              <div className='tma-section__header'>
                <div>
                  <p className='tma-section-label'>Hoạt động</p>
                  <h2 className='tma-section__title'>Chi tiêu gần đây</h2>
                </div>
              </div>

              <TmaDataState
                emptyDescription='Household này chưa có khoản chi trong phạm vi đang xem.'
                emptyTitle='Chưa có dữ liệu chi tiêu'
                errorDescription='Thử mở lại household hoặc kiểm tra lại dữ liệu local.'
                errorTitle='Không tải được chi tiêu gần đây'
                isEmpty={
                  !recentExpensesQuery.isLoading &&
                  !recentExpensesQuery.isError &&
                  recentExpenses.length === 0
                }
                isError={
                  recentExpensesQuery.isError && recentExpenses.length === 0
                }
                isLoading={
                  recentExpensesQuery.isLoading && recentExpenses.length === 0
                }
                loadingDescription='Dữ liệu sẽ hiện ngay khi household sync xong.'
                loadingTitle='Đang tải chi tiêu gần đây'
                retryAction={recentExpensesQuery.refetch}>
                <div className='tma-list-card'>
                  {recentExpenses.map((expense) => {
                    const category = getCategoryPresentation(
                      expense.categoryKey,
                      referenceCategories,
                    )

                    return (
                      <article key={expense.id} className='tma-expense-row'>
                        <div className='tma-household-avatar tma-household-avatar--sm'>
                          <span>{category.symbol}</span>
                        </div>

                        <div className='tma-expense-row__body'>
                          <div className='tma-expense-row__title-line'>
                            <h3>{expense.title.trim() || category.label}</h3>
                            <strong className='font-mono-money'>
                              {formatCurrencyMinor(
                                expense.amountMinor,
                                expense.currencyCode,
                              )}
                            </strong>
                          </div>

                          <p>
                            {getExpenseSecondaryText(
                              expense.note,
                              category.label,
                            )}
                          </p>

                          <div className='tma-expense-row__meta'>
                            <span>
                              {formatTimeLabel(
                                new Date(expense.occurredAt).toISOString(),
                              )}
                            </span>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </TmaDataState>
            </section>

            <section className='tma-section'>
              <div className='tma-section__header'>
                <div>
                  <p className='tma-section-label'>Thành viên</p>
                  <h2 className='tma-section__title'>Danh sách hiện tại</h2>
                </div>
              </div>

              <TmaDataState
                emptyDescription='Household này hiện chưa có thành viên nào khả dụng để hiển thị.'
                emptyTitle='Chưa có thành viên'
                errorDescription='Thử mở lại trang hoặc kiểm tra quyền truy cập household.'
                errorTitle='Không tải được thành viên'
                isEmpty={
                  !membersQuery.isLoading &&
                  !membersQuery.isError &&
                  members.length === 0
                }
                isError={membersQuery.isError && members.length === 0}
                isLoading={membersQuery.isLoading && members.length === 0}
                loadingDescription='Danh sách thành viên sẽ hiện khi truy vấn hoàn tất.'
                loadingTitle='Đang tải thành viên'
                retryAction={membersQuery.refetch}>
                <div className='tma-list-card'>
                  {members.map((member) => (
                    <article key={member.userId} className='tma-member-row'>
                      <div className='tma-household-avatar tma-household-avatar--sm'>
                        {member.avatarUrl ? (
                          <img
                            alt={member.name}
                            className='tma-avatar-image'
                            src={member.avatarUrl}
                          />
                        ) : (
                          <span>{getHouseholdAvatarFallback(member.name)}</span>
                        )}
                      </div>

                      <div className='tma-member-row__body'>
                        <div className='tma-member-row__title'>
                          <h3>
                            {member.name || user?.displayName || 'Thành viên'}
                          </h3>
                          <span className='tma-soft-pill'>
                            {getHouseholdRoleLabel(member.role)}
                          </span>
                        </div>

                        <p>{member.email}</p>
                      </div>

                      {member.userId === user?.id ? (
                        <span className='tma-soft-pill'>Bạn</span>
                      ) : null}
                    </article>
                  ))}
                </div>
              </TmaDataState>
            </section>
          </>
        ) : null}
      </TmaDataState>
    </TmaPageShell>
  )
}
