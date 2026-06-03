export interface LoadingFallbackProps {
  phase?: string
}

export const LoadingFallback = ({
  phase = 'bootstrapping',
}: LoadingFallbackProps) => (
  <div
    aria-live='polite'
    className='tma-loading'
    data-loading='auth-bootstrap'
    data-phase={phase}
    role='status'>
    <span className='tma-loading-spinner' />
  </div>
)
