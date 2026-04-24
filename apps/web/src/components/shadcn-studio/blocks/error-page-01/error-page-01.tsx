import { Button } from '@/components/ui/button'

const ErrorPage01 = () => {
  return (
    <div className='grid min-h-screen grid-cols-1 lg:grid-cols-2'>
      <div className='flex flex-col items-center justify-center px-4 py-8 text-center'>
        <h2 className='mb-6 text-5xl font-semibold'>Whoops!</h2>
        <h3 className='mb-1.5 text-3xl font-semibold'>Something went wrong</h3>
        <p className='mb-6 max-w-sm text-muted-foreground'>
          The page you&apos;re looking for isn&apos;t found, we suggest you back
          to home.
        </p>
        <Button asChild className='rounded-lg text-base' size='lg'>
          <a href='/'>Back to home page</a>
        </Button>
      </div>

      <div className='relative max-h-screen w-full p-2 max-lg:hidden'>
        <div className='h-full w-full rounded-2xl bg-black' />
        <img
          alt='404 illustration'
          className='absolute top-1/2 left-1/2 h-[clamp(260px,25vw,406px)] -translate-x-1/2 -translate-y-1/2'
          src='https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/error/image-1.png'
        />
      </div>
    </div>
  )
}

export default ErrorPage01
