import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { impact } from '@/lib/telegram/haptics'

import type { ScopeFilter } from '../hooks/use-budget-list'

type ScopeFilterBarProps = {
  value: ScopeFilter
  onChange: (next: ScopeFilter) => void
  options: { label: string; value: ScopeFilter }[]
}

export const BudgetScopeFilterBar = ({
  value,
  onChange,
  options,
}: ScopeFilterBarProps) => (
  <ToggleGroup
    className='flex flex-wrap gap-2'
    value={[value]}
    onValueChange={(values) => {
      const next = values[0] as ScopeFilter | undefined
      if (next) {
        impact('light')
        onChange(next)
      }
    }}>
    {options.map((option) => (
      <ToggleGroupItem key={option.value} value={option.value}>
        {option.label}
      </ToggleGroupItem>
    ))}
  </ToggleGroup>
)
