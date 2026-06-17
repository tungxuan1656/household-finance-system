import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { Button } from './button'
import { Card, CardDescription, CardTitle } from './card'

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

  const resolvedLoadingTitle = loadingTitle ?? t('dataState.loadingTitle')
  const resolvedLoadingDescription =
    loadingDescription ?? t('dataState.loadingDescription')
  const resolvedEmptyTitle = emptyTitle ?? t('dataState.emptyTitle')
  const resolvedEmptyDescription =
    emptyDescription ?? t('dataState.emptyDescription')
  const resolvedErrorTitle = errorTitle ?? t('dataState.errorTitle')
  const resolvedErrorDescription =
    errorDescription ?? t('dataState.errorDescription')

  if (isLoading || isError || isEmpty) {
    const title = isLoading
      ? resolvedLoadingTitle
      : isError
        ? resolvedErrorTitle
        : resolvedEmptyTitle
    const description = isLoading
      ? resolvedLoadingDescription
      : isError
        ? resolvedErrorDescription
        : resolvedEmptyDescription
    const action =
      customAction ??
      (isError && retryAction ? (
        <Button
          variant='ghost'
          onClick={() => {
            void retryAction()
          }}>
          {t('dataState.retry')}
        </Button>
      ) : null)

    return (
      <Card className={cn('grid gap-3', className)}>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <div className='flex justify-end'>{action}</div> : null}
      </Card>
    )
  }

  return <>{children}</>
}
