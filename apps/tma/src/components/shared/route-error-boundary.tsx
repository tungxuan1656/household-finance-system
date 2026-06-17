import { Component, type ErrorInfo, type ReactNode } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { AppShell } from '@/components/shared/app-shell'
import { Button, CardDescription, CardTitle } from '@/components/ui'
import { NotFoundPage } from '@/routes/not-found'

// ── Route-level error element (function component – can use hooks) ──
// Used as errorElement in createBrowserRouter.
// Distinguishes 404 (delegates to NotFoundPage) from runtime crashes.

export const RootErrorElement = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />
  }

  console.error('[RootErrorElement]', error)

  const message =
    import.meta.env.DEV && error instanceof Error
      ? error.message
      : 'An unexpected error occurred. Please try again.'

  return (
    <AppShell>
      <main className='grid min-h-0 flex-1 place-items-center p-6 text-center'>
        <div className='grid max-w-sm gap-3'>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>{message}</CardDescription>
          <Button
            className='justify-self-center'
            onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </main>
    </AppShell>
  )
}

// ── Child error boundary (class component – wraps rendered children) ──

interface RouteErrorBoundaryProps {
  children: ReactNode
}

interface RouteErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[RouteErrorBoundary]', error, errorInfo)
  }

  private handleRetry = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const message =
        import.meta.env.DEV && this.state.error
          ? this.state.error.message
          : 'An unexpected error occurred. Please try again.'

      return (
        <AppShell>
          <main className='grid min-h-0 flex-1 place-items-center p-6 text-center'>
            <div className='grid max-w-sm gap-3'>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>{message}</CardDescription>
              <Button
                className='justify-self-center'
                onClick={this.handleRetry}>
                Try again
              </Button>
            </div>
          </main>
        </AppShell>
      )
    }

    return this.props.children
  }
}
