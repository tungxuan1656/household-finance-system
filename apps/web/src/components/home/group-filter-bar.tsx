'use client'

import { X } from 'lucide-react'

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
  onOpenSelector,
}: GroupFilterBarProps) {
  if (activeGroupIds.length === 0) return null

  const activeGroups = availableGroups.filter((g) =>
    activeGroupIds.includes(g.id),
  )

  return (
    <div className='flex items-center gap-2 overflow-x-auto px-4 py-1'>
      {activeGroups.map((group) => (
        <div
          key={group.id}
          className='inline-flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1 text-xs'>
          <span>{group.name}</span>
          <button
            aria-label={`Remove ${group.name} filter`}
            className='text-muted-foreground transition-colors hover:text-foreground'
            type='button'
            onClick={() => onToggleGroup(group.id)}>
            <X className='size-3' />
          </button>
        </div>
      ))}
      <button
        className='px-2 py-1 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground'
        type='button'
        onClick={onOpenSelector}>
        [+ Filter]
      </button>
    </div>
  )
}

export { GroupFilterBar }
export type { GroupFilterBarProps, GroupInfo }
