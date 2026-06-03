import {
  GlobeIcon,
  HeartIcon,
  MoonIcon,
  SettingsIcon,
  SparkIcon,
  SunIcon,
} from '@/components/shared/tma-icons'
import { TmaPageHeader, TmaPageShell } from '@/components/shared/tma-page-shell'
import { useAuth } from '@/features/auth/auth-provider'
import { formatMonthLabel } from '@/lib/formatters'
import { impact, selection } from '@/lib/telegram/haptics'

const preferenceRows = [
  {
    title: 'Ngôn ngữ',
    value: 'Tiếng Việt',
    icon: GlobeIcon,
  },
  {
    title: 'Tiền tệ',
    value: 'VND (₫)',
    icon: SparkIcon,
  },
  {
    title: 'Nhịp nhắc',
    value: 'Tối 21:00',
    icon: SettingsIcon,
  },
] as const

export const SettingsPage = () => {
  const { user } = useAuth()

  return (
    <TmaPageShell
      header={
        <TmaPageHeader
          subtitle='Giữ mọi tuỳ chỉnh gọn, đúng với cảm giác tiện ích trong Telegram.'
          title='Cài đặt'
        />
      }>
      <section className='tma-settings-card'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Giao diện</p>
            <h2 className='tma-section__title'>
              Theo Telegram là mặc định thật
            </h2>
          </div>
        </div>

        <div className='tma-appearance-grid'>
          <button
            className='tma-appearance-option is-active'
            type='button'
            onClick={() => selection()}>
            <SparkIcon height='18' width='18' />
            <span>Theo Telegram</span>
          </button>
          <button
            disabled
            className='tma-appearance-option is-disabled'
            type='button'>
            <SunIcon height='18' width='18' />
            <span>Sáng</span>
          </button>
          <button
            disabled
            className='tma-appearance-option is-disabled'
            type='button'>
            <MoonIcon height='18' width='18' />
            <span>Tối</span>
          </button>
        </div>
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Tuỳ chọn</p>
            <h2 className='tma-section__title'>Thiết lập thường dùng</h2>
          </div>
        </div>

        <div className='tma-list-card'>
          {preferenceRows.map(({ title, value, icon: Icon }) => (
            <article
              key={title}
              className='tma-settings-row'
              role='button'
              tabIndex={0}
              onClick={() => selection()}
              onKeyDown={(e) => e.key === 'Enter' && selection()}>
              <span className='tma-settings-row__icon'>
                <Icon height='18' width='18' />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{value}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className='tma-support-card'>
        <div>
          <p className='tma-section-label'>Ủng hộ</p>
          <h2>Donate bằng Telegram Stars</h2>
          <p>
            Giữ dự án sống khoẻ, gọn, và tiếp tục ra thêm flow thật nhanh cho{' '}
            {formatMonthLabel(new Date())}.
          </p>
        </div>

        <button
          className='tma-support-card__cta'
          type='button'
          onClick={() => impact('medium')}>
          <HeartIcon height='18' width='18' />
          <span>Tặng Stars</span>
        </button>
      </section>

      <section className='tma-account-card'>
        <p className='tma-section-label'>Phiên hiện tại</p>
        <h2>{user?.displayName ?? user?.email ?? 'Tài khoản Telegram'}</h2>
        <p>
          {user?.provider === 'telegram'
            ? 'Đồng bộ qua Telegram'
            : 'Đồng bộ qua Firebase'}
        </p>
      </section>
    </TmaPageShell>
  )
}
