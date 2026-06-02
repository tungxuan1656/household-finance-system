import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

type PageContentProps = {
  children: ReactNode
  className?: string
  withBottomNavSpacing?: boolean
}

export const PageContent = ({
  children,
  className,
  withBottomNavSpacing = true,
}: PageContentProps) => {
  return (
    <div
      className={cn(
        'flex-1 px-4 py-5 md:px-6 md:py-0 md:pb-8 lg:px-8',
        withBottomNavSpacing
          ? 'pb-[calc(6rem+env(safe-area-inset-bottom))]'
          : 'pb-5 md:pb-8',
        className,
      )}>
      {children}
    </div>
  )
}
