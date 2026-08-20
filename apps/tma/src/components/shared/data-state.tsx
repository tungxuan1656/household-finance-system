import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

import {
  type QueryLike,
  QueryState,
  resolveQueryStateBranch,
} from './query-state'

/**
 * @deprecated Use `QueryStateBranch` from `query-state.tsx` (`QueryStateBranch`) instead.
 */
export type DataStateBranch = 'loading' | 'error' | 'empty' | 'content'

/**
 * @deprecated Use `resolveQueryStateBranch` from `query-state.tsx` instead.
 * Maps legacy flags to QueryState branch via fake QueryLike to keep test compatibility.
 */
export const resolveDataStateBranch = ({
  isLoading,
  isError,
  isEmpty,
}: {
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
}): DataStateBranch => {
  const fakeQuery: QueryLike<unknown> = {
    status: isLoading ? 'pending' : isError ? 'error' : 'success',
    data: undefined,
    fetchStatus: undefined,
  }
  const branch = resolveQueryStateBranch(fakeQuery, !!isEmpty)
  if (branch === 'pending') return 'loading'
  if (branch === 'error') return 'error'
  if (branch === 'empty') return 'empty'

  return 'content'
}

/**
 * @deprecated Use `QueryStateProps` from `query-state.tsx` instead.
 */
export interface DataStateProps {
  children?: ReactNode
  className?: string
  customAction?: ReactNode
  emptyDescription?: string
  emptyTitle?: string
  errorDescription?: string
  errorTitle?: string
  isEmpty?: boolean
  isError?: boolean
  isLoading?: boolean
  loadingDescription?: string
  loadingTitle?: string
  retryAction?: () => unknown | Promise<unknown>
}

/**
 * @deprecated Use `QueryState` from `./query-state` instead.
 * Deprecated alias that maps legacy DataState props to QueryState via QueryLike fake + resolveQueryStateBranch.
 */
export const DataState = ({
  children,
  className,
  customAction,
  emptyDescription,
  emptyTitle,
  errorDescription,
  errorTitle,
  isEmpty,
  isError,
  isLoading,
  loadingDescription,
  loadingTitle,
  retryAction,
}: DataStateProps) => {
  const { t } = useTranslation()
  const query: QueryLike<unknown> = {
    status: isLoading ? 'pending' : isError ? 'error' : 'success',
    data: undefined,
    fetchStatus: undefined,
    refetch: retryAction ? () => void retryAction() : undefined,
  }

  // Preserve legacy: customAction overrides retryAction for error branch
  const branch = resolveQueryStateBranch(query, !!isEmpty)
  if (branch === 'error' && customAction) {
    const title = errorTitle ?? t('dataState.errorTitle')
    const description = errorDescription ?? t('dataState.errorDescription')

    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardFooter className='justify-end'>{customAction}</CardFooter>
      </Card>
    )
  }

  return (
    <QueryState
      className={className}
      empty={{
        title: emptyTitle,
        description: emptyDescription,
        action: customAction ?? undefined,
      }}
      error={{ title: errorTitle, description: errorDescription }}
      isEmpty={!!isEmpty}
      pending={{ title: loadingTitle, description: loadingDescription }}
      query={query}
      retryAction={retryAction ? () => void retryAction() : undefined}
      variant='card'>
      {() => children}
    </QueryState>
  )
}
