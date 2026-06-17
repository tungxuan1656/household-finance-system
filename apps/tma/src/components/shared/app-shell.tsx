import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

export const AppShell = ({ children }: AppShellProps) => (
  <div className='flex h-dvh flex-col overflow-hidden bg-tma-base-bg pt-(--tma-safe-top) pr-(--tma-safe-right) pl-(--tma-safe-left) text-tma-text-strong'>
    {children}
  </div>
)
