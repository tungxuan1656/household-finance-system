import type { ReactElement, SVGProps } from 'react'

import { Section, SectionHeader } from '@/components/ui'
import { ShortcutItem } from '@/features/finance/components'
import { TMA_PATHS } from '@/lib/constants/routes'

const iconProps = {
  fill: 'none',
  height: 20,
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 1.9,
  viewBox: '0 0 24 24',
  width: 20,
} satisfies SVGProps<SVGSVGElement>

const ReceiptIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}>
    <path d='M7 3h10v18l-2.5-1.6L12 21l-2.5-1.6L7 21z' />
    <path d='M9 8h6' />
    <path d='M9 12h6' />
    <path d='M9 16h4' />
  </svg>
)

const HouseholdIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}>
    <path d='M4 11.5L12 5l8 6.5' />
    <path d='M6.5 10.5V19h11v-8.5' />
    <path d='M10 19v-4.5h4V19' />
  </svg>
)

const GroupIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}>
    <circle cx='9' cy='9' r='2.5' />
    <circle cx='16.5' cy='10' r='2' />
    <path d='M5.5 17c.8-2 2.3-3 4.5-3s3.7 1 4.5 3' />
    <path d='M14.5 17c.4-1.3 1.4-2.1 3-2.4' />
  </svg>
)

const BudgetIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}>
    <path d='M5 8.5c0-2.5 3.1-4.5 7-4.5 2.5 0 4.7.8 6 2.1' />
    <path d='M4.5 12c0-1.8 1.7-3.3 4.1-3.9' />
    <path d='M6 18c1.2 1.3 3.4 2 6 2 4.1 0 7-1.8 7-4.5 0-2.5-2.4-4.2-5.8-4.5' />
    <path d='M12 10v6' />
    <path d='M9.5 12.5c.4-.9 1.3-1.5 2.5-1.5 1.4 0 2.5.8 2.5 1.8S13.4 14.6 12 15c-1.4.3-2.5 1-2.5 2 0 1 .9 1.8 2.5 1.8 1.3 0 2.2-.5 2.6-1.4' />
  </svg>
)

const shortcutItems = [
  {
    title: 'Chi tiêu',
    hint: 'Lịch sử và bộ lọc đầy đủ',
    href: TMA_PATHS.expenses,
    icon: ReceiptIcon,
    accent: { background: '#edf4ff', foreground: '#3f7cff' },
    enabled: true,
  },
  {
    title: 'Gia đình',
    hint: 'Danh sách thành viên và ngân sách',
    href: TMA_PATHS.households,
    icon: HouseholdIcon,
    accent: { background: '#eef9f0', foreground: '#2f9b44' },
    enabled: true,
  },
  {
    title: 'Nhóm',
    hint: 'Theo dõi chi tiêu nhóm nhỏ',
    href: TMA_PATHS.groups,
    icon: GroupIcon,
    accent: { background: '#fff3e8', foreground: '#ff8a3d' },
    enabled: true,
  },
  {
    title: 'Ngân sách',
    hint: 'Xem mức còn lại trong tháng',
    href: TMA_PATHS.budgets,
    icon: BudgetIcon,
    accent: { background: '#fff6d9', foreground: '#b48800' },
    enabled: true,
  },
] as const satisfies Array<{
  accent: { background: string; foreground: string }
  enabled: boolean
  hint: string
  href: string
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement
  title: string
}>

export const HomeShortcutsSection = () => (
  <Section>
    <SectionHeader title='Lối tắt' />
    <div className='grid grid-cols-2 gap-2.5'>
      {shortcutItems.map((item) => (
        <ShortcutItem
          key={item.title}
          accent={item.accent}
          disabled={!item.enabled}
          hint={item.hint}
          href={item.href}
          icon={item.icon}
          title={item.title}
        />
      ))}
    </div>
  </Section>
)
