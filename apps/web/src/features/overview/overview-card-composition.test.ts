import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const sourceRoot = join(process.cwd(), 'src')

const readSource = (path: string) =>
  readFileSync(join(sourceRoot, path), 'utf8')

describe('overview card composition source contracts', () => {
  it('uses extracted OverviewTabs for lens switching instead of LensSelector', () => {
    const pageSource = readSource('features/overview/pages/overview-page.tsx')
    const tabsSource = readSource(
      'features/overview/components/overview-tabs.tsx',
    )

    expect(pageSource).toContain('OverviewTabs')
    expect(pageSource).not.toContain('<Tabs')
    expect(pageSource).not.toContain('LensSelector')
    expect(pageSource).not.toContain('components/home/lens-selector')

    expect(tabsSource).toContain('@/components/ui/tabs')
    expect(tabsSource).toContain('<Tabs')
    expect(tabsSource).toContain('<TabsList')
    expect(tabsSource).toContain('<TabsTrigger')
    expect(tabsSource).toContain('<TabsContent')
  })

  it.each([
    'features/overview/components/hero-stats-card.tsx',
    'features/overview/components/empty-state.tsx',
    'features/overview/components/recent-expenses.tsx',
  ])('%s uses Card anatomy for widget structure', (path) => {
    const source = readSource(path)

    expect(source).toContain('<Card')
    expect(source).toContain('<CardHeader')
    expect(source).toContain('<CardTitle')
    expect(source).toContain('<CardContent')
  })

  it('keeps overview page orchestration thin by delegating data widgets to smart sections', () => {
    const source = readSource('features/overview/pages/overview-page.tsx')

    expect(source).toContain('OverviewRecentExpensesSection')
    expect(source).toContain('OverviewCategoryStatisticsSection')
    expect(source).not.toContain('useInfiniteExpenseListQuery')
    expect(source).not.toContain('useExpenseGroupListQuery')
    expect(source).not.toContain('useReferenceCategoriesQuery')
  })

  it('renders Home category statistics as a Recharts donut with a value list', () => {
    const source = readSource(
      'features/overview/components/category-breakdown.tsx',
    )

    expect(source).toContain("from 'recharts'")
    expect(source).toContain('ResponsiveContainer')
    expect(source).toContain('<PieChart')
    expect(source).toContain('<Pie')
    expect(source).toContain('<Cell')
    expect(source).toContain('<Tooltip')
    expect(source).toContain("role='img'")
    expect(source).toContain('aria-describedby')
    expect(source).toContain('formatCurrency')
    expect(source).toContain('percentOfTotal')
    expect(source).toContain('expenseCount')
    expect(source).not.toContain('@/components/ui/progress')
    expect(source).not.toContain('<Progress')
  })
})
