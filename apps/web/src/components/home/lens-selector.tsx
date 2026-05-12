'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { t } from '@/lib/i18n/t'

type Lens =
  | { type: 'personal' }
  | { type: 'household'; householdId: string; householdName: string }

type LensSelectorProps = {
  lenses: Lens[]
  activeLens: Lens | null
  onLensChange: (lens: Lens) => void
}

function getLensLabel(lens: Lens): string {
  if (lens.type === 'personal') return t('app.overview.lenses.personal')

  return lens.householdName
}

function getLensValue(lens: Lens): string {
  if (lens.type === 'personal') return 'personal'

  return `household:${lens.householdId}`
}

function LensSelector({ lenses, activeLens, onLensChange }: LensSelectorProps) {
  if (lenses.length === 0) return null

  const activeValue = activeLens ? getLensValue(activeLens) : undefined

  return (
    <ToggleGroup
      className='justify-center overflow-x-auto px-4 md:px-0'
      size='sm'
      type='single'
      value={activeValue}
      variant='pill'
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
        <ToggleGroupItem key={getLensValue(lens)} value={getLensValue(lens)}>
          {getLensLabel(lens)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export { LensSelector }
export type { Lens, LensSelectorProps }
