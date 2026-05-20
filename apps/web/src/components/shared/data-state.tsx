'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'

const EMPTY_TITLE = 'Không có dữ liệu'
const EMPTY_DESCRIPTION =
  'Không có dữ liệu mà bạn đang tìm kiếm, vui lòng thử lại sau'
const ERROR_TITLE = 'Không thể tải dữ liệu'
const ERROR_DESCRIPTION = 'Đã có lỗi xảy ra, vui lòng thử lại sau'

type DataStateProps = React.ComponentProps<typeof Card> & {
  isLoading?: boolean
  isEmpty?: boolean
  isError?: boolean
  title?: string
  emptyTitle?: string
  emptyDescription?: string
  errorTitle?: string
  errorDescription?: string
  showRetryAction?: boolean
  retryAction?: () => unknown
  customAction?: ReactNode
}

function DataState({
  isLoading,
  isEmpty,
  isError,
  children,
  title,
  emptyTitle,
  emptyDescription,
  errorTitle,
  errorDescription,
  showRetryAction,
  retryAction,
  customAction,
  ...props
}: DataStateProps) {
  const shouldShowRetryAction =
    !customAction &&
    Boolean(retryAction) &&
    (showRetryAction ?? Boolean(retryAction))
  const resolvedAction =
    customAction ??
    (shouldShowRetryAction ? (
      <Button
        variant='outline'
        onClick={() => {
          if (!retryAction) return

          void retryAction()
        }}>
        {t('app.households.actions.retry')}
      </Button>
    ) : null)

  if (isLoading) {
    return (
      <Card {...props}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className='flex flex-col gap-4'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || isEmpty) {
    const placeholderTitle = isError
      ? (errorTitle ?? title ?? ERROR_TITLE)
      : (emptyTitle ?? title ?? EMPTY_TITLE)
    const placeholderDescription = isError
      ? (errorDescription ?? ERROR_DESCRIPTION)
      : (emptyDescription ?? EMPTY_DESCRIPTION)

    return (
      <Card {...props}>
        <CardHeader className='text-center'>
          <CardTitle>{placeholderTitle}</CardTitle>
          {placeholderDescription ? (
            <CardDescription>{placeholderDescription}</CardDescription>
          ) : null}
        </CardHeader>
        {resolvedAction && (
          <CardContent className='flex justify-center'>
            {resolvedAction}
          </CardContent>
        )}
      </Card>
    )
  }

  return <>{children}</>
}

export type { DataStateProps }
export { DataState }
