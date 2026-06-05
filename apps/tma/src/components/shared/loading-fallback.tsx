export interface LoadingFallbackProps {
  phase?: string
}

export const LoadingFallback = ({
  phase = 'bootstrapping',
}: LoadingFallbackProps) => (
  <div
    aria-live='polite'
    className='grid min-h-[100dvh] place-items-center p-6 text-tma-text-muted'
    data-loading='auth-bootstrap'
    data-phase={phase}
    role='status'>
    <span className='size-8 animate-tma-spin rounded-full border-[3px] border-current border-t-transparent' />
  </div>
)
