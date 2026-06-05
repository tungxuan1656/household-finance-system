import type { ReactNode } from 'react'

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

const DEFAULT_LOADING_TITLE = 'Đang tải dữ liệu'
const DEFAULT_LOADING_DESCRIPTION =
  'Nội dung sẽ xuất hiện ngay khi truy vấn hoàn tất.'
const DEFAULT_EMPTY_TITLE = 'Không có dữ liệu'
const DEFAULT_EMPTY_DESCRIPTION = 'Hiện chưa có dữ liệu để hiển thị ở mục này.'
const DEFAULT_ERROR_TITLE = 'Không thể tải dữ liệu'
const DEFAULT_ERROR_DESCRIPTION = 'Đã có lỗi xảy ra, vui lòng thử lại sau.'

export const DataState = ({
  children,
  className,
  customAction,
  emptyDescription = DEFAULT_EMPTY_DESCRIPTION,
  emptyTitle = DEFAULT_EMPTY_TITLE,
  errorDescription = DEFAULT_ERROR_DESCRIPTION,
  errorTitle = DEFAULT_ERROR_TITLE,
  isEmpty,
  isError,
  isLoading,
  loadingDescription = DEFAULT_LOADING_DESCRIPTION,
  loadingTitle = DEFAULT_LOADING_TITLE,
  retryAction,
}: DataStateProps) => {
  if (isLoading || isError || isEmpty) {
    const title = isLoading ? loadingTitle : isError ? errorTitle : emptyTitle
    const description = isLoading
      ? loadingDescription
      : isError
        ? errorDescription
        : emptyDescription
    const action =
      customAction ??
      (isError && retryAction ? (
        <Button
          variant='ghost'
          onClick={() => {
            void retryAction()
          }}>
          Thử lại
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
