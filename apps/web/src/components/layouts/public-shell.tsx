import { Outlet } from 'react-router-dom'

function PublicShell() {
  return (
    <div className='flex min-h-dvh min-w-dvw flex-1 items-center justify-center bg-background p-4 sm:p-6'>
      <main className='flex flex-1'>
        <Outlet />
      </main>
    </div>
  )
}

export { PublicShell }
