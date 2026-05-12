import type { ReactNode } from 'react'

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className='relative flex min-h-dvh min-w-dvw flex-1 items-center justify-center overflow-hidden bg-background p-4 sm:p-6'>
      {/* Premium Background Elements */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -top-[25%] -left-[10%] h-[70%] w-[70%] rounded-full bg-primary/10 blur-[160px]' />
        <div className='absolute -right-[5%] -bottom-[20%] h-[60%] w-[60%] rounded-full bg-violet-500/10 blur-[140px]' />
        <div className='absolute top-1/2 left-1/2 h-[50%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-[160px]' />
      </div>

      <main className='relative z-10 flex flex-1 items-center justify-center'>
        {children}
      </main>
    </div>
  )
}

export { PublicLayout }
