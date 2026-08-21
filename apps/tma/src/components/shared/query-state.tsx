import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { TmaHapticButton } from './tma-haptic-button'

export type QueryLike<T> = {
  status: 'pending' | 'error' | 'success'
  fetchStatus?: 'idle' | 'fetching' | 'paused'
  data: T | undefined
  refetch?: () => unknown
}

export type QueryStateBranch =
  | 'idle'
  | 'pending'
  | 'error'
  | 'empty'
  | 'success'

export function resolveQueryStateBranch<T>(
  query: QueryLike<T>,
  isEmpty: boolean | ((data: T) => boolean) = false,
): QueryStateBranch {
  // fetchStatus 'idle' after a successful fetch means "not fetching", not disabled.
  // Only treat as idle (hidden) when the query is still pending and not fetching (enabled === false).
  if (query.status === 'pending' && query.fetchStatus === 'idle') return 'idle'
  if (query.status === 'pending') return 'pending'
  if (query.status === 'error') return 'error'
  if (query.status === 'success') {
    let empty = false
    if (typeof isEmpty === 'function') {
      try {
        empty = (isEmpty as (data: T) => boolean)(query.data as T)
      } catch {
        empty = query.data === undefined
      }
      // Success with undefined must never render children(undefined) -> crash/white.
      // Force empty so QueryState shows notFound instead of calling children.
      if (query.data === undefined && !empty) empty = true
    } else {
      empty = isEmpty
    }
    if (empty) return 'empty'

    return 'success'
  }

  return 'success'
}

export interface QueryStateProps<T> {
  query: QueryLike<T>
  isEmpty?: boolean | ((data: T) => boolean)
  variant?: 'card' | 'plain'
  className?: string
  pending?: ReactNode | { title?: string; description?: string }
  empty?: { title?: string; description?: string; action?: ReactNode }
  error?: { title?: string; description?: string }
  retryAction?: () => unknown
  children: (data: T) => ReactNode
}

function isPendingObject(
  value: unknown,
): value is { title?: string; description?: string } {
  if (typeof value !== 'object' || value === null) return false
  if ('$$typeof' in (value as Record<string, unknown>)) return false

  const record = value as Record<string, unknown>

  return 'title' in record || 'description' in record
}

export function QueryState<T>({
  query,
  isEmpty = false,
  variant = 'card',
  className,
  pending,
  empty,
  error,
  retryAction,
  children,
}: QueryStateProps<T>) {
  const { t } = useTranslation()
  const branch = resolveQueryStateBranch(query, isEmpty)

  if (branch === 'idle') return null

  if (branch === 'success') {
    return <>{children(query.data as T)}</>
  }

  const resolvedRetryAction = retryAction ?? query.refetch

  if (branch === 'pending') {
    // Custom ReactNode pending
    if (
      pending !== undefined &&
      pending !== null &&
      !isPendingObject(pending)
    ) {
      return <>{pending as ReactNode}</>
    }

    const pendingObj =
      (pending as { title?: string; description?: string }) ?? {}
    const title = pendingObj.title ?? t('dataState.loadingTitle')
    const description =
      pendingObj.description ?? t('dataState.loadingDescription')

    if (variant === 'plain') {
      return (
        <div className={cn(className)}>
          <div className='flex flex-col gap-1.5'>
            <div className='font-heading text-lg font-semibold tracking-wider uppercase'>
              {title}
            </div>
            {description ? (
              <div className='text-sm leading-relaxed text-muted-foreground'>
                {description}
              </div>
            ) : null}
          </div>
          <div className='mt-4 grid gap-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-5/6' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        </div>
      )
    }

    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className='grid gap-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-5/6' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (branch === 'empty') {
    const title = empty?.title ?? t('dataState.emptyTitle')
    const description = empty?.description ?? t('dataState.emptyDescription')
    const action = empty?.action

    if (variant === 'plain') {
      return (
        <Empty className={cn(className)}>
          <EmptyHeader>
            <EmptyTitle>{title}</EmptyTitle>
            {description ? (
              <EmptyDescription>{description}</EmptyDescription>
            ) : null}
          </EmptyHeader>
          {action ? <EmptyContent>{action}</EmptyContent> : null}
        </Empty>
      )
    }

    return (
      <Card>
        <Empty className={cn(className)}>
          <EmptyHeader>
            <EmptyTitle>{title}</EmptyTitle>
            {description ? (
              <EmptyDescription>{description}</EmptyDescription>
            ) : null}
          </EmptyHeader>
          {action ? <EmptyContent>{action}</EmptyContent> : null}
        </Empty>
      </Card>
    )
  }

  // branch === 'error'
  const title = error?.title ?? t('dataState.errorTitle')
  const description = error?.description ?? t('dataState.errorDescription')
  const retryNode = resolvedRetryAction ? (
    <TmaHapticButton
      variant='outline'
      onClick={() => {
        void resolvedRetryAction()
      }}>
      {t('dataState.retry')}
    </TmaHapticButton>
  ) : null

  if (variant === 'plain') {
    return (
      <div className={cn(className)}>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{title}</EmptyTitle>
            {description ? (
              <EmptyDescription>{description}</EmptyDescription>
            ) : null}
          </EmptyHeader>
          {retryNode ? <EmptyContent>{retryNode}</EmptyContent> : null}
        </Empty>
      </div>
    )
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {retryNode ? (
        <CardFooter className='justify-end'>{retryNode}</CardFooter>
      ) : null}
    </Card>
  )
}
