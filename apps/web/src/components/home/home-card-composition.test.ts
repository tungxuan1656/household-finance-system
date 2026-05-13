import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const sourceRoot = join(process.cwd(), 'src')

const readSource = (path: string) =>
  readFileSync(join(sourceRoot, path), 'utf8')

describe('home card composition source contracts', () => {
  it('uses extracted OverviewTabs for lens switching instead of LensSelector', () => {
    const pageSource = readSource('views/app/overview-page.tsx')
    const tabsSource = readSource('views/app/overview/overview-tabs.tsx')

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

  it('composes the desktop sidebar as a Card container', () => {
    const source = readSource('components/layouts/app-sidebar.tsx')

    expect(source).toContain('@/components/ui/card')
    expect(source).toContain('<Card')
    expect(source).toContain('<CardHeader')
    expect(source).toContain('<CardContent')
    expect(source).toContain('<CardFooter')
    expect(source).not.toContain('rounded-lg bg-background p-4 shadow-sm')
  })

  it.each([
    'components/home/hero-stats-card.tsx',
    'components/home/empty-state.tsx',
    'components/home/household-cards-section.tsx',
    'components/home/budget-status-cards.tsx',
  ])('%s uses Card anatomy for widget structure', (path) => {
    const source = readSource(path)

    if (path === 'components/home/hero-stats-card.tsx') {
      expect(source).toContain('StateCard')
    }
    expect(source).toContain('<Card')
    expect(source).toContain('<CardHeader')
    expect(source).toContain('<CardTitle')
    expect(source).toContain('<CardContent')
  })

  it('uses StateCard as the shared loading, empty, and error wrapper', () => {
    const source = readSource('components/shared/state-card.tsx')

    expect(source).toContain('isLoading?: boolean')
    expect(source).toContain('isEmpty?: boolean')
    expect(source).toContain('isError?: boolean')
    expect(source).toContain('emptyDescription?: string')
    expect(source).toContain('errorDescription?: string')
    expect(source).toContain('function StateCard')
    expect(source).toContain("const ERROR_TITLE = 'Không thể tải dữ liệu'")

    expect(source).toContain(
      "const ERROR_DESCRIPTION = 'Đã có lỗi xảy ra, vui lòng thử lại sau'",
    )

    expect(source).toContain('if (isError || isEmpty)')
  })

  it('keeps overview page orchestration thin by delegating data widgets to smart sections', () => {
    const source = readSource('views/app/overview-page.tsx')

    expect(source).toContain('OverviewRecentExpensesSection')
    expect(source).toContain('OverviewCategoryStatisticsSection')
    expect(source).not.toContain('useInfiniteExpenseListQuery')
    expect(source).not.toContain('useExpenseGroupListQuery')
    expect(source).not.toContain('useReferenceCategoriesQuery')
  })
})
