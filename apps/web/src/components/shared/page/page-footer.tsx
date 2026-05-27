import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

type PageFooterProps = {
  children: ReactNode
  className?: string
  sticky?: boolean
}

export const PageFooter = ({
  children,
  className,
  sticky = false,
}: PageFooterProps) => {
  return (
    <div
      className={cn(
        'px-4 pt-4 pb-24 md:px-6 md:pb-8 lg:px-8',
        sticky
          ? 'sticky bottom-16 z-30 border-t border-border/50 bg-background/95 backdrop-blur-md md:bottom-0'
          : undefined,
        className,
      )}>
      {children}
    </div>
  )
}
