'use client'

import type { ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const EMPTY_TITLE = 'Không có dữ liệu'
const EMPTY_DESCRIPTION =
  'Không có dữ liệu mà bạn đang tìm kiếm, vui lòng thử lại sau'
const ERROR_TITLE = 'Không thể tải dữ liệu'
const ERROR_DESCRIPTION = 'Đã có lỗi xảy ra, vui lòng thử lại sau'

type StateCardProps = React.ComponentProps<typeof Card> & {
  isLoading?: boolean
  isEmpty?: boolean
  isError?: boolean
  title?: string
  emptyTitle?: string
  emptyDescription?: string
  errorTitle?: string
  errorDescription?: string
  action?: ReactNode
}

function StateCard({
  isLoading,
  isEmpty,
  isError,
  children,
  title,
  emptyTitle,
  emptyDescription,
  errorTitle,
  errorDescription,
  action,
  ...props
}: StateCardProps) {
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
          <CardDescription>{placeholderDescription}</CardDescription>
        </CardHeader>
        {action && (
          <CardContent className='flex justify-center'>{action}</CardContent>
        )}
      </Card>
    )
  }

  return <Card {...props}>{children}</Card>
}

export type { StateCardProps }
export { StateCard }
