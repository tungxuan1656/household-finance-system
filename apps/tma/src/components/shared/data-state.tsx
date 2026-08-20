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

export type DataStateBranch = 'loading' | 'error' | 'empty' | 'content'

export const resolveDataStateBranch = ({
  isLoading,
  isError,
  isEmpty,
}: {
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
}): DataStateBranch => {
  if (isLoading) return 'loading'
  if (isError) return 'error'
  if (isEmpty) return 'empty'

  return 'content'
}

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
  const branch = resolveDataStateBranch({ isLoading, isError, isEmpty })

  const resolvedLoadingTitle = loadingTitle ?? t('dataState.loadingTitle')
  const resolvedLoadingDescription =
    loadingDescription ?? t('dataState.loadingDescription')
  const resolvedEmptyTitle = emptyTitle ?? t('dataState.emptyTitle')
  const resolvedEmptyDescription =
    emptyDescription ?? t('dataState.emptyDescription')
  const resolvedErrorTitle = errorTitle ?? t('dataState.errorTitle')
  const resolvedErrorDescription =
    errorDescription ?? t('dataState.errorDescription')

  if (branch === 'content') return <>{children}</>

  const title =
    branch === 'loading'
      ? resolvedLoadingTitle
      : branch === 'error'
        ? resolvedErrorTitle
        : resolvedEmptyTitle
  const description =
    branch === 'loading'
      ? resolvedLoadingDescription
      : branch === 'error'
        ? resolvedErrorDescription
        : resolvedEmptyDescription

  const retryActionNode =
    branch === 'error' && retryAction ? (
      <TmaHapticButton
        variant='outline'
        onClick={() => {
          void retryAction()
        }}>
        {t('dataState.retry')}
      </TmaHapticButton>
    ) : null

  const action = customAction ?? retryActionNode

  if (branch === 'loading') {
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

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {action ? (
        <CardFooter className='justify-end'>{action}</CardFooter>
      ) : null}
    </Card>
  )
}
