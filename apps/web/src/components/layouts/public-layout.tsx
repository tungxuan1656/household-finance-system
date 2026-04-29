import type { ReactNode } from 'react'

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-dvh min-w-dvw flex-1 items-center justify-center bg-background p-4 sm:p-6'>
      <main className='flex flex-1'>{children}</main>
    </div>
  )
}

export { PublicLayout }
