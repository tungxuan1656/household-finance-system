'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

type Lens =
  | { type: 'personal' }
  | { type: 'household'; householdId: string; householdName: string }

type LensSelectorProps = {
  lenses: Lens[]
  activeLens: Lens | null
  onLensChange: (lens: Lens) => void
}

function getLensLabel(lens: Lens): string {
  if (lens.type === 'personal') return 'Personal'

  return lens.householdName
}

function getLensValue(lens: Lens): string {
  if (lens.type === 'personal') return 'personal'

  return `household:${lens.householdId}`
}

function lensesEqual(a: Lens, b: Lens): boolean {
  if (a.type !== b.type) return false
  if (a.type === 'personal' && b.type === 'personal') return true
  if (a.type === 'household' && b.type === 'household') {
    return a.householdId === b.householdId
  }

  return false
}

function LensSelector({ lenses, activeLens, onLensChange }: LensSelectorProps) {
  if (lenses.length === 0) return null

  const activeValue = activeLens ? getLensValue(activeLens) : undefined

  return (
    <>
      {/* Desktop: pill-style ToggleGroup */}
      <ToggleGroup
        className='hidden justify-center md:flex'
        type='single'
        value={activeValue}
        variant='outline'
        onValueChange={(value: string) => {
          if (!value) return
          if (value === 'personal') {
            onLensChange({ type: 'personal' })
          } else {
            const householdId = value.replace('household:', '')
            const lens = lenses.find(
              (l): l is Extract<Lens, { type: 'household' }> =>
                l.type === 'household' && l.householdId === householdId,
            )
            if (lens) onLensChange(lens)
          }
        }}>
        {lenses.map((lens) => (
          <ToggleGroupItem
            key={getLensValue(lens)}
            className='data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/80'
            value={getLensValue(lens)}>
            {getLensLabel(lens)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Mobile: horizontal scrollable tabs */}
      <div className='flex gap-1 overflow-x-auto px-4 whitespace-nowrap md:hidden'>
        {lenses.map((lens) => {
          const isActive = activeLens ? lensesEqual(lens, activeLens) : false

          return (
            <button
              key={getLensValue(lens)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground',
              )}
              type='button'
              onClick={() => onLensChange(lens)}>
              {getLensLabel(lens)}
            </button>
          )
        })}
      </div>
    </>
  )
}

export { LensSelector }
export type { Lens, LensSelectorProps }
