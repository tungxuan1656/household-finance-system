import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

export const AppShell = ({ children }: AppShellProps) => (
  <div className='flex h-[100dvh] flex-col overflow-hidden bg-tma-base-bg pt-[var(--tma-safe-top)] pr-[var(--tma-safe-right)] pl-[var(--tma-safe-left)] text-tma-text-strong'>
    {children}
  </div>
)
