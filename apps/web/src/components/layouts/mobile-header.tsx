'use client'

import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  actions?: ReactNode
}

function MobileHeader({ title, showBack, onBack, actions }: MobileHeaderProps) {
  return (
    <header className='sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-4 pt-safe backdrop-blur-md md:hidden'>
      <div className='flex items-center gap-3'>
        {showBack && (
          <Button size='icon' variant='ghost' onClick={onBack}>
            <ArrowLeft className='size-5' />
          </Button>
        )}
        <h1 className='truncate text-lg font-semibold'>{title}</h1>
      </div>
      {actions && <div className='flex items-center gap-2'>{actions}</div>}
    </header>
  )
}

export { MobileHeader }
