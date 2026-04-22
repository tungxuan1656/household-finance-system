import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function AuthPanel({
  actionLabel,
  children,
  description,
  footer,
  onSubmit,
  title,
}: {
  actionLabel: string
  children: React.ReactNode
  description: string
  footer: React.ReactNode
  onSubmit?: React.FormEventHandler<HTMLFormElement>
  title: string
}) {
  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader>
        <p className='text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase'>
          Public route
        </p>
        <h1 className='font-heading text-2xl tracking-tight'>{title}</h1>
        <p className='text-xs/relaxed text-muted-foreground'>{description}</p>
      </CardHeader>

      <CardContent>
        <form className='space-y-5' onSubmit={onSubmit}>
          <div className='space-y-4'>{children}</div>

          <div className='flex flex-wrap items-center gap-3'>
            <Button type='submit'>{actionLabel}</Button>
          </div>
        </form>

        <div className='mt-4 text-xs text-muted-foreground'>{footer}</div>
      </CardContent>
    </Card>
  )
}

export { AuthPanel }
