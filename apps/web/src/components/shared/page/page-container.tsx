import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

type PageContainerProps = {
  children: ReactNode
  className?: string
}

export const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      {children}
    </div>
  )
}
