import { describe, expect, it } from 'vitest'

import { badgeVariants } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { toggleVariants } from '@/components/ui/toggle'

describe('responsive variant class contracts', () => {
  it('keeps button mobile-first sizing', () => {
    expect(buttonVariants({ size: 'default' })).toContain('h-11')
    expect(buttonVariants({ size: 'default' })).toContain('sm:h-9')
    expect(buttonVariants({ size: 'default' })).toContain('text-base')
    expect(buttonVariants({ size: 'default' })).toContain('sm:text-sm')
    expect(buttonVariants({ size: 'default' })).toContain('gap-2')
    expect(buttonVariants({ size: 'default' })).toContain('sm:gap-1.5')

    expect(buttonVariants({ size: 'sm' })).toContain('h-9')
    expect(buttonVariants({ size: 'sm' })).toContain('sm:h-8')

    expect(buttonVariants({ size: 'lg' })).toContain('h-12')
    expect(buttonVariants({ size: 'lg' })).toContain('sm:h-10')

    expect(buttonVariants({ size: 'icon' })).toContain('size-11')
    expect(buttonVariants({ size: 'icon' })).toContain('sm:size-9')

    expect(buttonVariants({ size: 'xl' })).toContain('h-13')
    expect(buttonVariants({ size: 'xl' })).toContain('sm:h-11')
  })

  it('keeps toggle mobile-first sizing', () => {
    expect(toggleVariants({ size: 'default' })).toContain('h-11')
    expect(toggleVariants({ size: 'default' })).toContain('sm:h-9')
    expect(toggleVariants({ size: 'default' })).toContain('min-w-11')
    expect(toggleVariants({ size: 'default' })).toContain('sm:min-w-9')
    expect(toggleVariants({ size: 'default' })).toContain('text-base')
    expect(toggleVariants({ size: 'default' })).toContain('sm:text-sm')

    expect(toggleVariants({ size: 'sm' })).toContain('h-9')
    expect(toggleVariants({ size: 'sm' })).toContain('sm:h-8')

    expect(toggleVariants({ variant: 'pill' })).toContain(
      'data-[state=on]:bg-primary',
    )

    expect(toggleVariants({ variant: 'default' })).toContain(
      'data-[state=on]:bg-muted',
    )
  })

  it('preserves badge compatibility variant', () => {
    expect(badgeVariants({ variant: 'filter' })).toContain('bg-muted')
  })
})
