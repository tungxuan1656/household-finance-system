'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type CardPlaceholderProps = React.ComponentProps<typeof Card> & {
  isLoading?: boolean
  isEmpty?: boolean
  title?: string
  description?: string
}

function CardPlaceholder({
  isLoading,
  isEmpty,
  children,
  title,
  description,
  ...props
}: CardPlaceholderProps) {
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

  if (isEmpty) {
    return (
      <Card {...props}>
        <CardHeader className='text-center'>
          <CardTitle>{title ?? 'Không có dữ liệu'}</CardTitle>
          <CardDescription>
            {description ??
              'Không có dữ liệu mà bạn đang tìm kiếm, vui lòng thử lại sau'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return <Card {...props}>{children}</Card>
}

export { CardPlaceholder }
