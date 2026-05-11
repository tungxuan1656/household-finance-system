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
    <div className='m-auto w-full max-w-md animate-in duration-500 ease-out zoom-in-95 fade-in'>
      <Card className='relative overflow-hidden border-white/20 bg-background/60 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/60'>
        {/* Subtle top light effect */}
        <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent' />

        <CardHeader className='space-y-1.5 pb-6 text-center'>
          <CardTitle className='font-heading text-3xl font-bold tracking-tight'>
            {title}
          </CardTitle>
          <CardDescription className='text-sm text-muted-foreground/80'>
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className='pb-8'>
          <form className='space-y-5' onSubmit={onSubmit}>
            <div className='space-y-4'>{children}</div>

            <div className='pt-2'>
              <Button
                className='w-full font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-100 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                disabled={isSubmitting}
                size='lg'
                type='submit'>
                {isSubmitting ? (
                  <span className='flex items-center gap-2'>
                    <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                    {actionLabel}...
                  </span>
                ) : (
                  actionLabel
                )}
              </Button>
            </div>
          </form>

          <div className='mt-8 flex flex-col items-center gap-4 text-center'>
            <div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent' />
            <div className='text-sm text-muted-foreground'>{footer}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
