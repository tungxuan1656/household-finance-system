import { type FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  formatCurrencyMinor,
  getCurrentPeriod,
  getHouseholdBudgetLabel,
} from '@/features/home/presentation'
import { getHouseholdDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatMonthLabel } from '@/lib/formatters'
import { impact } from '@/lib/telegram/haptics'

import {
  useCreateHouseholdMutation,
  useHouseholdBudgetQueries,
  useHouseholdListQuery,
  useHouseholdMemberQueries,
  useHouseholdOverviewQueries,
} from '../api'
import {
  formatMemberCountLabel,
  getHouseholdAvatarFallback,
  getHouseholdRoleLabel,
} from '../presentation'

export const HouseholdListPage = () => {
  const navigate = useNavigate()
  const period = getCurrentPeriod()
  const householdsQuery = useHouseholdListQuery()
  const createHouseholdMutation = useCreateHouseholdMutation()
  const [draftName, setDraftName] = useState('')
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [feedback, setFeedback] = useState<{
    message: string
    tone: 'error' | 'success'
  } | null>(null)

  const households = householdsQuery.data?.items ?? []
  const memberQueries = useHouseholdMemberQueries(households)
  const overviewQueries = useHouseholdOverviewQueries(households, period)
  const budgetQueries = useHouseholdBudgetQueries(households, period)

  const householdCards = useMemo(
    () =>
      households.map((household, index) => {
        const memberQuery = memberQueries[index]
        const overviewQuery = overviewQueries[index]
        const budgetQuery = budgetQueries[index]

        return {
          household,
          budget: budgetQuery?.data?.items[0] ?? null,
          currencyCode: overviewQuery?.data?.currencyCode,
          isLoading: Boolean(
            memberQuery?.isLoading ||
            overviewQuery?.isLoading ||
            budgetQuery?.isLoading,
          ),
          memberCount: memberQuery?.data?.items.length ?? 0,
          totalSpendMinor: overviewQuery?.data?.totalSpendMinor,
        }
      }),
    [budgetQueries, households, memberQueries, overviewQueries],
  )

  const handleCreateHousehold = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = draftName.trim()

    if (!name) {
      setFeedback({
        message: 'Nhập tên household trước khi tạo mới.',
        tone: 'error',
      })

      return
    }

    try {
      const created = await createHouseholdMutation.mutateAsync({ name })

      setDraftName('')
      setIsComposerOpen(false)

      setFeedback({
        message: 'Đã tạo household mới. Mở chi tiết để tiếp tục chỉnh sửa.',
        tone: 'success',
      })

      navigate(getHouseholdDetailPath(created.id))
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : 'Không thể tạo household lúc này.',
        tone: 'error',
      })
    }
  }

  const showComposer = isComposerOpen || householdCards.length === 0

  return (
    <TmaPageShell showBackButton backTo={TMA_PATHS.root} title='Gia đình'>
      <section className='tma-hero-card tma-household-hub-card'>
        <div className='tma-summary-card__topline'>
          <div>
            <p className='tma-section-label'>Household hub</p>
            <strong>{householdCards.length}</strong>
            <p>
              Chọn từng household để xem avatar, thành viên và chi tiêu trong
              tháng.
            </p>
          </div>

          <span className='tma-chip tma-chip--strong'>
            {formatMonthLabel(new Date())}
          </span>
        </div>
      </section>

      {feedback ? (
        <section
          className={`tma-feedback-banner tma-feedback-banner--${feedback.tone}`}>
          <p>{feedback.message}</p>
        </section>
      ) : null}

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Danh sách</p>
            <h2 className='tma-section__title'>Household của bạn</h2>
          </div>

          {showComposer ? null : (
            <button
              className='tma-chip-button'
              type='button'
              onClick={() => {
                impact('light')
                setIsComposerOpen(true)
                setFeedback(null)
              }}>
              <span>Tạo mới</span>
            </button>
          )}
        </div>

        {householdsQuery.isError && householdCards.length === 0 ? (
          <div className='tma-empty-card'>
            <h2>Không tải được household</h2>
            <p>
              Kiểm tra phiên đăng nhập hoặc dữ liệu local rồi thử mở lại trang.
            </p>
          </div>
        ) : householdsQuery.isLoading && householdCards.length === 0 ? (
          <div className='tma-empty-card'>
            <h2>Đang tải household</h2>
            <p>Danh sách sẽ hiện ngay khi các truy vấn hoàn tất.</p>
          </div>
        ) : householdCards.length === 0 ? (
          <div className='tma-empty-card'>
            <h2>Chưa có household nào</h2>
            <p>
              Tạo household đầu tiên để bắt đầu theo dõi chi tiêu chia sẻ trong
              TMA.
            </p>
          </div>
        ) : (
          <div className='tma-household-grid'>
            {householdCards.map((card) => (
              <Link
                key={card.household.id}
                className='tma-household-overview-card'
                to={getHouseholdDetailPath(card.household.id)}
                onClick={() => {
                  impact('light')
                }}>
                <div className='tma-household-overview-card__head'>
                  <div className='tma-household-avatar'>
                    {card.household.avatarUrl ? (
                      <img
                        alt={card.household.name}
                        className='tma-avatar-image'
                        src={card.household.avatarUrl}
                      />
                    ) : (
                      <span>
                        {getHouseholdAvatarFallback(card.household.name)}
                      </span>
                    )}
                  </div>

                  <span className='tma-status-pill'>
                    {getHouseholdRoleLabel(card.household.role)}
                  </span>
                </div>

                <div className='tma-household-overview-card__copy'>
                  <h3>{card.household.name}</h3>
                  <p>{formatMemberCountLabel(card.memberCount)}</p>
                </div>

                <div className='tma-household-stat-grid'>
                  <article className='tma-household-stat'>
                    <span>Chi tháng này</span>
                    <strong className='font-mono-money'>
                      {card.totalSpendMinor != null && card.currencyCode
                        ? formatCurrencyMinor(
                            card.totalSpendMinor,
                            card.currencyCode,
                          )
                        : card.isLoading
                          ? 'Đang tải...'
                          : '—'}
                    </strong>
                  </article>

                  <article className='tma-household-stat'>
                    <span>Ngân sách</span>
                    <strong>
                      {getHouseholdBudgetLabel(
                        card.totalSpendMinor,
                        card.budget,
                      )}
                    </strong>
                  </article>
                </div>

                <div className='tma-household-overview-card__foot'>
                  <span>Mở chi tiết</span>
                  <span>{card.household.defaultCurrencyCode}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Hành động</p>
            <h2 className='tma-section__title'>Tạo household mới</h2>
          </div>
        </div>

        <section className='tma-list-card tma-create-household-card'>
          <div>
            <h3>
              {showComposer ? 'Đặt tên household mới' : 'Tạo thêm household'}
            </h3>
            <p>
              Dùng tên ngắn, dễ nhận ra. Bạn có thể chỉnh avatar và thông tin
              chi tiết sau khi tạo xong.
            </p>
          </div>

          {showComposer ? (
            <form
              className='tma-create-household-card__form'
              onSubmit={handleCreateHousehold}>
              <input
                className='tma-text-input'
                disabled={createHouseholdMutation.isPending}
                placeholder='Ví dụ: Nhà Phùng Thịnh'
                type='text'
                value={draftName}
                onChange={(event) => {
                  setDraftName(event.target.value)
                  setFeedback(null)
                }}
              />

              <div className='tma-action-row'>
                {householdCards.length > 0 ? (
                  <button
                    className='tma-action-button tma-action-button--ghost'
                    disabled={createHouseholdMutation.isPending}
                    type='button'
                    onClick={() => {
                      setIsComposerOpen(false)
                      setDraftName('')
                    }}>
                    Hủy
                  </button>
                ) : null}

                <button
                  className='tma-action-button tma-action-button--primary'
                  disabled={createHouseholdMutation.isPending}
                  type='submit'>
                  {createHouseholdMutation.isPending
                    ? 'Đang tạo...'
                    : 'Tạo household'}
                </button>
              </div>
            </form>
          ) : (
            <button
              className='tma-action-button tma-action-button--primary'
              type='button'
              onClick={() => {
                impact('light')
                setIsComposerOpen(true)
              }}>
              Mở form tạo mới
            </button>
          )}
        </section>
      </section>
    </TmaPageShell>
  )
}
