import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const sourceRoot = join(process.cwd(), 'src')

const readSource = (path: string) =>
  readFileSync(join(sourceRoot, path), 'utf8')

describe('home card composition source contracts', () => {
  it('uses shadcn tabs for lens switching instead of LensSelector', () => {
    const source = readSource('views/app/overview-page.tsx')

    expect(source).toContain('@/components/ui/tabs')
    expect(source).toContain('<Tabs')
    expect(source).toContain('<TabsList')
    expect(source).toContain('<TabsTrigger')
    expect(source).toContain('<TabsContent')
    expect(source).not.toContain('LensSelector')
    expect(source).not.toContain('components/home/lens-selector')
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
  ])('%s uses full Card anatomy for widget structure', (path) => {
    const source = readSource(path)

    expect(source).toContain('<Card')
    expect(source).toContain('<CardHeader')
    expect(source).toContain('<CardTitle')
    expect(source).toContain('<CardContent')
  })
})
