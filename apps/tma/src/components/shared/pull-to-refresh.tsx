'use client'

import type { ReactNode } from 'react'
import PullToRefreshLib from 'react-simple-pull-to-refresh'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh?: () => Promise<void>
  pullDownThreshold?: number
  resistance?: number
  pullingContent?: ReactNode
  refreshingContent?: ReactNode
}

export const PullToRefresh = ({
  children,
  onRefresh,
  pullDownThreshold = 80,
  resistance = 2.5,
  pullingContent,
  refreshingContent,
}: PullToRefreshProps) => {
  return (
    <PullToRefreshLib
      pullDownThreshold={pullDownThreshold}
      pullingContent={pullingContent}
      refreshingContent={refreshingContent}
      resistance={resistance}
      onRefresh={onRefresh ?? (async () => {})}>
      <div
        className='h-full min-h-0'
        onScroll={(e) => {
          e.currentTarget.dispatchEvent(
            new CustomEvent('scroll', { bubbles: true }),
          )
        }}>
        {children}
      </div>
    </PullToRefreshLib>
  )
}

export default PullToRefresh
