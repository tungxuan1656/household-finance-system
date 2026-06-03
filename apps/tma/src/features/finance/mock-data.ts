export interface AccentToken {
  background: string
  foreground: string
}

export interface FinanceCategory {
  id: string
  label: string
  symbol: string
  accent: AccentToken
}

export interface ExpenseSource {
  id: string
  label: string
  detail: string
}

export interface HouseholdCardItem {
  id: string
  name: string
  members: number
  monthSpend: number
  budgetLabel: string
  accent: AccentToken
}

export interface ExpenseItem {
  id: string
  title: string
  note: string
  amount: number
  occurredAt: string
  categoryId: string
  household?: string
  group?: string
}

export interface StatisticSlice {
  id: 'day' | 'week' | 'month' | 'year'
  total: number
  changeLabel: string
  selectedCategory: string
  chartBars: Array<{
    label: string
    amount: number
    tone: 'primary' | 'positive' | 'muted' | 'warning'
  }>
  legends: Array<{
    label: string
    amount: number
    tone: 'primary' | 'positive' | 'warning'
  }>
  ranking: Array<{
    label: string
    amount: number
    percent: number
  }>
}

export const categoryOptions: FinanceCategory[] = [
  {
    id: 'food',
    label: 'Ăn uống',
    symbol: 'AU',
    accent: { background: '#edf4ff', foreground: '#3f7cff' },
  },
  {
    id: 'transport',
    label: 'Di chuyển',
    symbol: 'DC',
    accent: { background: '#eef9f0', foreground: '#2f9b44' },
  },
  {
    id: 'shopping',
    label: 'Mua sắm',
    symbol: 'MS',
    accent: { background: '#fff3e8', foreground: '#ff8a3d' },
  },
  {
    id: 'bills',
    label: 'Hóa đơn',
    symbol: 'HD',
    accent: { background: '#fff6d9', foreground: '#b48800' },
  },
  {
    id: 'health',
    label: 'Sức khỏe',
    symbol: 'SK',
    accent: { background: '#ffeef2', foreground: '#d14d7b' },
  },
  {
    id: 'family',
    label: 'Gia đình',
    symbol: 'GD',
    accent: { background: '#f0f0ff', foreground: '#6250d4' },
  },
  {
    id: 'education',
    label: 'Học tập',
    symbol: 'HT',
    accent: { background: '#ebfbff', foreground: '#148ea1' },
  },
  {
    id: 'travel',
    label: 'Du lịch',
    symbol: 'DL',
    accent: { background: '#fff0f6', foreground: '#c94c7c' },
  },
]

export const expenseSources: ExpenseSource[] = [
  { id: 'cash', label: 'Tiền mặt', detail: 'Ví cá nhân' },
  { id: 'bank', label: 'Ngân hàng', detail: 'Tài khoản chính' },
  { id: 'ewallet', label: 'Ví điện tử', detail: 'MoMo / ZaloPay' },
]

export const householdOptions: HouseholdCardItem[] = [
  {
    id: 'household-1',
    name: 'Nhà Mây',
    members: 4,
    monthSpend: 12650000,
    budgetLabel: 'Còn dư 18%',
    accent: { background: '#edf4ff', foreground: '#3f7cff' },
  },
  {
    id: 'household-2',
    name: 'Gia đình Sài Gòn',
    members: 3,
    monthSpend: 8420000,
    budgetLabel: 'Ổn định',
    accent: { background: '#eef9f0', foreground: '#2f9b44' },
  },
  {
    id: 'household-3',
    name: 'Nhóm đi chợ',
    members: 2,
    monthSpend: 2310000,
    budgetLabel: 'Gần chạm ngưỡng',
    accent: { background: '#fff6d9', foreground: '#b48800' },
  },
]

export const groupOptions = [
  { id: 'group-1', label: 'Sinh hoạt chung' },
  { id: 'group-2', label: 'Ăn ngoài cuối tuần' },
  { id: 'group-3', label: 'Di chuyển' },
]

export const recentExpenses: ExpenseItem[] = [
  {
    id: 'expense-1',
    title: 'Bữa tối cùng gia đình',
    note: 'Lẩu nấm cuối tuần',
    amount: 540000,
    occurredAt: '2026-06-03T19:25:00+07:00',
    categoryId: 'food',
    household: 'Nhà Mây',
    group: 'Ăn ngoài cuối tuần',
  },
  {
    id: 'expense-2',
    title: 'Đi chợ đầu tuần',
    note: 'Rau củ, trái cây',
    amount: 315000,
    occurredAt: '2026-06-03T08:40:00+07:00',
    categoryId: 'shopping',
    household: 'Nhà Mây',
  },
  {
    id: 'expense-3',
    title: 'Gửi xe văn phòng',
    note: 'Cả ngày',
    amount: 12000,
    occurredAt: '2026-06-02T09:05:00+07:00',
    categoryId: 'transport',
  },
  {
    id: 'expense-4',
    title: 'Điện tháng 5',
    note: 'Thanh toán online',
    amount: 1320000,
    occurredAt: '2026-06-01T21:10:00+07:00',
    categoryId: 'bills',
    household: 'Gia đình Sài Gòn',
  },
  {
    id: 'expense-5',
    title: 'Thuốc cảm',
    note: 'Nhà thuốc gần nhà',
    amount: 185000,
    occurredAt: '2026-05-31T14:15:00+07:00',
    categoryId: 'health',
  },
  {
    id: 'expense-6',
    title: 'Sách cho bé',
    note: 'Combo truyện tranh',
    amount: 268000,
    occurredAt: '2026-05-30T16:30:00+07:00',
    categoryId: 'education',
    household: 'Nhà Mây',
  },
  {
    id: 'expense-7',
    title: 'Cafe họp nhóm',
    note: '3 người',
    amount: 146000,
    occurredAt: '2026-05-29T10:00:00+07:00',
    categoryId: 'family',
    group: 'Sinh hoạt chung',
  },
  {
    id: 'expense-8',
    title: 'Đặt vé xe',
    note: 'Về quê cuối tháng',
    amount: 420000,
    occurredAt: '2026-05-28T11:25:00+07:00',
    categoryId: 'travel',
  },
  {
    id: 'expense-9',
    title: 'Đổ xăng',
    note: 'Xe máy',
    amount: 90000,
    occurredAt: '2026-05-27T18:45:00+07:00',
    categoryId: 'transport',
  },
  {
    id: 'expense-10',
    title: 'Mua nhu yếu phẩm',
    note: 'Nước rửa chén, giấy',
    amount: 234000,
    occurredAt: '2026-05-26T20:10:00+07:00',
    categoryId: 'shopping',
    household: 'Gia đình Sài Gòn',
  },
]

export const statisticMonths = [
  new Date('2026-06-01T00:00:00+07:00'),
  new Date('2026-05-01T00:00:00+07:00'),
  new Date('2026-04-01T00:00:00+07:00'),
]

export const statisticSlices: Record<StatisticSlice['id'], StatisticSlice> = {
  day: {
    id: 'day',
    total: 742000,
    changeLabel: '+14% so với hôm qua',
    selectedCategory: 'Ăn uống',
    chartBars: [
      { label: '06h', amount: 12, tone: 'muted' },
      { label: '10h', amount: 18, tone: 'positive' },
      { label: '14h', amount: 9, tone: 'muted' },
      { label: '18h', amount: 32, tone: 'primary' },
      { label: '22h', amount: 21, tone: 'warning' },
    ],
    legends: [
      { label: 'Ăn uống', amount: 420000, tone: 'primary' },
      { label: 'Đi lại', amount: 92000, tone: 'positive' },
      { label: 'Khác', amount: 230000, tone: 'warning' },
    ],
    ranking: [
      { label: 'Bữa tối', amount: 320000, percent: 43 },
      { label: 'Cafe', amount: 100000, percent: 13 },
      { label: 'Gửi xe', amount: 12000, percent: 2 },
    ],
  },
  week: {
    id: 'week',
    total: 3540000,
    changeLabel: '-8% so với tuần trước',
    selectedCategory: 'Mua sắm',
    chartBars: [
      { label: 'T2', amount: 18, tone: 'muted' },
      { label: 'T3', amount: 28, tone: 'primary' },
      { label: 'T4', amount: 22, tone: 'positive' },
      { label: 'T5', amount: 14, tone: 'muted' },
      { label: 'T6', amount: 34, tone: 'warning' },
      { label: 'T7', amount: 38, tone: 'primary' },
      { label: 'CN', amount: 26, tone: 'positive' },
    ],
    legends: [
      { label: 'Mua sắm', amount: 1320000, tone: 'primary' },
      { label: 'Ăn uống', amount: 980000, tone: 'positive' },
      { label: 'Hóa đơn', amount: 610000, tone: 'warning' },
    ],
    ranking: [
      { label: 'Đi chợ', amount: 910000, percent: 26 },
      { label: 'Cuối tuần', amount: 680000, percent: 19 },
      { label: 'Di chuyển', amount: 305000, percent: 9 },
    ],
  },
  month: {
    id: 'month',
    total: 12650000,
    changeLabel: '+6% so với tháng trước',
    selectedCategory: 'Nhà Mây',
    chartBars: [
      { label: 'Tuần 1', amount: 26, tone: 'muted' },
      { label: 'Tuần 2', amount: 34, tone: 'positive' },
      { label: 'Tuần 3', amount: 31, tone: 'primary' },
      { label: 'Tuần 4', amount: 42, tone: 'warning' },
    ],
    legends: [
      { label: 'Ăn uống', amount: 4520000, tone: 'primary' },
      { label: 'Mua sắm', amount: 3380000, tone: 'positive' },
      { label: 'Hóa đơn', amount: 1860000, tone: 'warning' },
    ],
    ranking: [
      { label: 'Ăn uống', amount: 4520000, percent: 36 },
      { label: 'Mua sắm', amount: 3380000, percent: 27 },
      { label: 'Hóa đơn', amount: 1860000, percent: 15 },
    ],
  },
  year: {
    id: 'year',
    total: 142800000,
    changeLabel: '+11% so với năm ngoái',
    selectedCategory: 'Sinh hoạt chung',
    chartBars: [
      { label: 'Q1', amount: 24, tone: 'muted' },
      { label: 'Q2', amount: 36, tone: 'primary' },
      { label: 'Q3', amount: 29, tone: 'positive' },
      { label: 'Q4', amount: 32, tone: 'warning' },
    ],
    legends: [
      { label: 'Gia đình', amount: 56300000, tone: 'primary' },
      { label: 'Nhóm', amount: 43800000, tone: 'positive' },
      { label: 'Cá nhân', amount: 42700000, tone: 'warning' },
    ],
    ranking: [
      { label: 'Gia đình', amount: 56300000, percent: 39 },
      { label: 'Nhóm', amount: 43800000, percent: 31 },
      { label: 'Cá nhân', amount: 42700000, percent: 30 },
    ],
  },
}

export const findCategory = (categoryId: string): FinanceCategory =>
  categoryOptions.find((category) => category.id === categoryId) ??
  categoryOptions[0]
