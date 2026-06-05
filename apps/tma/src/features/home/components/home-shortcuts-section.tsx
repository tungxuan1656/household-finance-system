import { Link } from 'react-router-dom'

import { TmaMonogramBadge } from '@/components/shared/tma-page-shell'
import { TMA_PATHS } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

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

export const HomeShortcutsSection = () => (
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
)
