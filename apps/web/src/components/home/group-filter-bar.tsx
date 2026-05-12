'use client'

import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/i18n/t'

type GroupInfo = {
  id: string
  name: string
}

type GroupFilterBarProps = {
  availableGroups: GroupInfo[]
  activeGroupIds: string[]
  onToggleGroup: (groupId: string) => void
  onClearAll: () => void
  onOpenSelector: () => void
}

function GroupFilterBar({
  availableGroups,
  activeGroupIds,
  onToggleGroup,
  onClearAll,
  onOpenSelector,
}: GroupFilterBarProps) {
  if (activeGroupIds.length === 0) return null

  const activeGroups = availableGroups.filter((g) =>
    activeGroupIds.includes(g.id),
  )

  return (
    <div className='flex items-center gap-2 overflow-x-auto px-4 py-1'>
      {activeGroups.map((group) => (
        <Badge key={group.id} className='gap-1' variant='filter'>
          <span>{group.name}</span>
          <button
            aria-label={`Remove ${group.name} filter`}
            type='button'
            onClick={() => onToggleGroup(group.id)}>
            <X className='size-3' />
          </button>
        </Badge>
      ))}
      <Button
        className='h-7 px-3 text-xs'
        type='button'
        variant='ghost'
        onClick={onOpenSelector}>
        {t('app.overview.filters.add')}
      </Button>
      <Button
        className='h-7 px-3 text-xs'
        type='button'
        variant='ghost'
        onClick={onClearAll}>
        {t('app.overview.filters.clearAll')}
      </Button>
    </div>
  )
}

export { GroupFilterBar }
export type { GroupFilterBarProps, GroupInfo }
