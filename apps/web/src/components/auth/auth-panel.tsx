import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const AuthPanel = ({
  actionLabel,
  children,
  description,
  isSubmitting = false,
  footer,
  onSubmit,
  title,
}: {
  actionLabel: string
  children: React.ReactNode
  description: string
  isSubmitting?: boolean
  footer: React.ReactNode
  onSubmit?: React.FormEventHandler<HTMLFormElement>
  title: string
}) => {
  return (
    <Card className='m-auto h-full w-full max-w-md shadow-lg'>
      <CardHeader>
        <CardTitle className='font-heading text-3xl tracking-tight'>
          {title}
        </CardTitle>
        <CardDescription className='text-sm text-muted-foreground'>
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className='space-y-2' onSubmit={onSubmit}>
          <div className='space-y-3'>{children}</div>

          <div className='pt-4'>
            <Button className='w-full' disabled={isSubmitting} type='submit'>
              {actionLabel}
            </Button>
          </div>
        </form>

        <div className='mt-6 text-center text-sm text-muted-foreground'>
          {footer}
        </div>
      </CardContent>
    </Card>
  )
}
